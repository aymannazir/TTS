from flask import Flask, request, jsonify, send_from_directory
from googletrans import Translator
from langdetect import detect, DetectorFactory

DetectorFactory.seed = 0  # for consistent results

app = Flask(__name__, static_url_path='', static_folder='static')
translator = Translator()

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/speak', methods=['POST'])
def speak():
    try:
        data = request.get_json(force=True)
        text = data.get('text', '').strip()
        language = data.get('language', 'en-US').lower()
        auto_detect = data.get('autoDetect', False)

        if not text:
            return jsonify({'error': 'Text input is empty.'}), 400

        if auto_detect:
            detected_lang = detect(text)
            lang_code = detected_lang.lower()
        else:
            # "en-US" -> just use "en"
            lang_code = language.split('-')[0]

        # Translate if not English
        if lang_code != 'en':
            translated = translator.translate(text, dest=lang_code)
            text = translated.text

        return jsonify({
            'status': 'translated',
            'text': text,
            'language': lang_code
        })
    except Exception as e:
        return jsonify({'error': f'Translation or detection failed: {str(e)}'}), 500

@app.route('/detect', methods=['POST'])
def detect_language():
    try:
        data = request.get_json(force=True)
        text = data.get('text', '').strip()

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        lang_code = detect(text)
        return jsonify({'language': lang_code.lower()})
    except Exception as e:
        return jsonify({'error': f'Language detection failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
