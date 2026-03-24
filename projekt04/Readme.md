Projekt realizuje prosty serwer HTTP stworzony w Node.js z wykorzystaniem frameworka Express i silnika szablonow EJS.
Tematem projektu jest aplikacja quizowa o wiedzy z dziedziny NBA.

Aby uruchomic projekt:

1. Sklonuj repozytorium i przejdz do folderu projektu:

w terminalu 
git clone https://github.com/Adamluczek/PZAW.git
cd projekt04


2. Zainstaluj zaleznosci:

w terminalu 
npm install


3. Uruchom skrypt `.sh` do wygenerowania pliku `.env` (wymagane):

w terminalu 
npm run generate_env


4. Stworz i zapelnij baze danych:

w terminalu 
npm run populate_db


5. Uruchom serwer:

w terminalu 
npm run dev


6. Otworz aplikacje w przegladarce:

http://localhost:8000