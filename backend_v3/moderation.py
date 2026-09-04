import json
import logging
import os
import unicodedata

import pykakasi
import requests

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
NG_WORDS_FILE = os.path.join(BASE_DIR, "data", "ng_words.json")

OPENAI_MODERATION_URL = "https://api.openai.com/v1/moderations"
OPENAI_MODERATION_MODEL = "omni-moderation-latest"

_kks = pykakasi.kakasi()
_logger = logging.getLogger(__name__)

_words_cache = None
_words_cache_mtime = None
_ng_forms_cache = None


def _normalize(text):
    # 全角/半角ゆれや大文字小文字の違いで抜けないよう正規化する
    return unicodedata.normalize("NFKC", text or "").lower()


def _phonetic_forms(text):
    """ひらがな読み・ヘボン式ローマ字・訓令式ローマ字の3つを返す。
    漢字/ひらがな/カタカナ/ローマ字のどの表記で書かれていても
    同じ言葉として比較できるようにするため。"""
    text = _normalize(text)
    if not text:
        return "", "", ""
    try:
        converted = _kks.convert(text)
    except Exception:
        return text, text, text
    hira = "".join(item["hira"] for item in converted)
    hepburn = "".join(item["hepburn"] for item in converted).lower()
    kunrei = "".join(item["kunrei"] for item in converted).lower()
    return hira, hepburn, kunrei


def _load_words():
    global _words_cache, _words_cache_mtime
    if not os.path.exists(NG_WORDS_FILE):
        return []
    mtime = os.path.getmtime(NG_WORDS_FILE)
    if _words_cache is not None and _words_cache_mtime == mtime:
        return _words_cache

    with open(NG_WORDS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    # {"カテゴリ名": [単語, ...]} 形式と、単純な配列の両方に対応する
    if isinstance(data, dict):
        words = [w for words_in_category in data.values() for w in words_in_category]
    else:
        words = data

    _words_cache = [w for w in words if w]
    _words_cache_mtime = mtime
    return _words_cache


def load_ng_words():
    return _load_words()


def _ng_word_forms():
    """NGワード1語ごとの読み・ローマ字表記をキャッシュして返す。"""
    global _ng_forms_cache, _words_cache_mtime
    words = _load_words()
    # _load_words()がファイル更新を検知した場合はこちらも作り直す
    if _ng_forms_cache is not None and _ng_forms_cache[0] == _words_cache_mtime:
        return _ng_forms_cache[1]

    forms = [(word, *_phonetic_forms(word)) for word in words]
    _ng_forms_cache = (_words_cache_mtime, forms)
    return forms


def find_ng_word(text):
    """textにNGワードが含まれていれば元のNGワードを返す。無ければNone。
    ひらがな・カタカナ・漢字・ローマ字(ヘボン式/訓令式)の表記ゆれを
    吸収して判定する。"""
    if not text:
        return None

    normalized = _normalize(text)
    text_hira, text_hepburn, text_kunrei = _phonetic_forms(text)

    for word, word_hira, word_hepburn, word_kunrei in _ng_word_forms():
        if _normalize(word) in normalized:
            return word
        if word_hira and word_hira in text_hira:
            return word
        if word_hepburn and len(word_hepburn) >= 3 and word_hepburn in text_hepburn:
            return word
        if word_kunrei and len(word_kunrei) >= 3 and word_kunrei in text_kunrei:
            return word
    return None


def check_image_moderation(image_data_url):
    """OpenAI Moderation API (omni-moderation) で画像の不適切表現を判定する。

    戻り値:
        True  -> 不適切と判定された（送信をブロックすべき）
        False -> 問題なしと判定された
        None  -> APIキー未設定または通信エラーで判定できなかった
                 （呼び出し側はフェイルクローズドで送信を拒否する）
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        _logger.warning("OPENAI_API_KEY未設定のため画像モデレーションを実行できません")
        return None

    try:
        response = requests.post(
            OPENAI_MODERATION_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": OPENAI_MODERATION_MODEL,
                "input": [{"type": "image_url", "image_url": {"url": image_data_url}}],
            },
            timeout=15,
        )
        response.raise_for_status()
        results = response.json().get("results") or []
        return bool(results and results[0].get("flagged"))
    except Exception:
        _logger.exception("画像モデレーションAPIの呼び出しに失敗しました")
        return None
