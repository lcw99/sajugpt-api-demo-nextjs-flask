from flask import Flask
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the function from saju module
from saju import get_saju_reading

app = Flask(__name__)

# Register the saju route
app.add_url_rule('/api/saju', 'saju', get_saju_reading, methods=['POST'])

@app.route("/api/python")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == '__main__':
    app.run(debug=True, port=5328)