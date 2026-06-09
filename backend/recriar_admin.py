from app.database import SessionLocal
from app.crud import hash_password
from app.models import User
import uuid

db = SessionLocal()
email = "admin@recruitai.com"
password = "admin123"
hashed = hash_password(password)

# Remove qualquer utilizador com o mesmo email
db.query(User).filter(User.email == email).delete()
db.commit()

# Cria o novo administrador
user = User(
    id=str(uuid.uuid4()),
    email=email,
    password_hash=hashed,
    role="ADMIN",
    full_name="Administrador",
    is_active=True
)
db.add(user)
db.commit()
print(f"✅ Administrador recriado com sucesso!\nEmail: {email}\nSenha: {password}")
db.close()