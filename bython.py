from flask import Flask, request, render_template, send_from_directory
import paramiko
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'Aucun fichier sélectionné'
    files = request.files.getlist('file')
    if not files:
        return 'Aucun fichier sélectionné'
    for file in files:
        if file.filename == '':
            return 'Aucun fichier sélectionné'
        if file:
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(filepath)
            send_to_sftp(filepath, file.filename)
    return 'Fichiers téléchargés et envoyés au SFTP avec succès'

def send_to_sftp(filepath, filename):
    host = '127.0.0.1'
    port = 22
    username = 'dan'
    password = '0000'

    transport = paramiko.Transport((host, port))
    transport.connect(username=username, password=password)

    sftp = paramiko.SFTPClient.from_transport(transport)
    sftp.put(filepath, filename)
    sftp.close()
    transport.close()

if __name__ == '__main__':
    app.run(debug=True)