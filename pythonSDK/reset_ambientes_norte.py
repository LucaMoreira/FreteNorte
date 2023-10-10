import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore, auth
from datetime import datetime
import json 
from dotenv import load_dotenv
from random import randint
import os


load_dotenv()

cred = credentials.Certificate(os.getenv("firebase_secret"))
app = firebase_admin.initialize_app(cred)


db = firestore.client()


def load_json_file(filename):
    with open(filename) as fp:
        content = json.load(fp)
    return content

def batch_write(collection: str, dictarray: list[dict], key_id: str | None = None):
    batch = db.batch()
    collection_ref = db.collection(collection)
    k = 1
    for i in range(0, len(dictarray), 500):
        chunk = dictarray[i:i+500]
        for document in chunk:
            if key_id:
                doc_ref = collection_ref.document(str(document[key_id]))
                batch.set(doc_ref, document)
        print(f"{collection}: chunk {k} ({len(chunk)} documents)")
        k += 1
        batch.commit()





if __name__ == "__main__":
    ambientes_norte = load_json_file('json0929/ambientes-norte.json')
    amb_norte_codigo = [x["codigo"] for x in ambientes_norte ]
    batch_write('ambientes-norte', ambientes_norte, 'codigo')
    db.document('agregados/ambientes_norte').set({'codigos': sorted(amb_norte_codigo)})