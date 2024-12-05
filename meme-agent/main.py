from flask import Flask, request, jsonify

from src.services.llm import LlmService

app = Flask(__name__)

llm_service = LlmService()

@app.route('/ask', methods=['POST'])
def ask():
    """Handle user questions and generate responses."""
    data = request.get_json()
    question = data.get('question')
    
    if not question:
        return jsonify({'error': 'No question provided'}), 400

    response = llm_service.get_answer(question)
    return jsonify({'response': response})

if __name__ == "__main__":
    app.run(port=5001)