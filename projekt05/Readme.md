Projekt realizuje prosty serwer HTTP stworzony w Node.js z wykorzystaniem frameworka Express i silnika szablonow EJS.
Tematem projektu jest aplikacja quizowa o wiedzy z dziedziny NBA.

Logowanie odbywa sie za pomoca unikatowego loginu (email) i hasla.

Aby uruchomic projekt:

1. Sklonuj repozytorium i przejdz do folderu projektu:

w terminalu 
git clone https://github.com/Adamluczek/PZAW.git
cd PZAW/projekt05


2. Zainstaluj zaleznosci:

w terminalu 
npm install


3. Uruchom skrypt `.sh` do wygenerowania pliku `.env` (wymagane):

w terminalu 
npm run generate_env
Skrypt wygeneruje plik `.env` z losowymi wartościami. Jeśli wolisz ustawić własne wartości, utwórz plik `.env` z następującymi zmiennymi (wypełnij wartości samodzielnie):

PORT=8000
SECRET=your-session-secret-here
PEPPER=your-pepper-hex-here
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password-here

4. Stworz i zapelnij baze danych:

w terminalu 
npm run populate_db


5. Uruchom serwer:

w terminalu 
npm run dev


6. Otworz aplikacje w przegladarce:

http://localhost:8000

7. Konto administratora:

Konto administratora jest tworzone podczas uruchamiania `npm run populate_db`.
Dane logowania admina sa pobierane z pliku `.env`:
- `ADMIN_USERNAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Wartosci te sa generowane przez skrypt `npm run generate_env`.