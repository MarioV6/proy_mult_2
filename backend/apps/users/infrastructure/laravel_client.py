import json
import urllib.request
import urllib.parse

class LaravelUserClient:
    @staticmethod
    def get_user_info(user_id=None):
        # Construimos la URL con el ID si existe
        base_url = "http://127.0.0.1:8001/api/user-info"
        if user_id:
            base_url += f"?id={user_id}"
            
        urls = [
            base_url,
            base_url.replace("127.0.0.1:8001", "localhost:8001"),
        ]
        
        for url in urls:
            try:
                with urllib.request.urlopen(url, timeout=2) as response:
                    if response.status == 200:
                        return json.loads(response.read().decode())
            except Exception as e:
                print(f"Error conectando a {url}: {e}")
                continue
                
        return {"id": 0, "name": "Error de Conexión API"}
