Projekt realizuje prosty serwer HTTP stworzony w Node.js z wykorzystaniem frameworka Express i silnika szablonow EJS.
Tematem projektu jest aplikacja quizowa o wiedzy z dziedziny NBA.

Logowanie odbywa sie za pomoca unikatowego loginu (email) i hasla.

Aby uruchomic projekt:

1. Sklonuj repozytorium i przejdz do folderu projektu:

w terminalu 
git clone https://github.com/Adamluczek/PZAW.git
cd projekt05


2. Zainstaluj zaleznosci:

w terminalu 
npm install


3. Uruchom skrypt `.sh` do wygenerowania pliku `.env` (wymagane):

w terminalu 
npm run generate_env
Jeśli nie będzie nic w pliku wklej do niego:
PORT=8000
SECRET="$/UiYqsfP4/Rc}~bHf5t_lkF3v(Z`W@uhz+]i9;t]e!LsORko/hSZ8ib(.7epN/o"
PEPPER="dFBE5d38ff2B8b04Ff1ecc90beA6CCcBb11eDc1cc5167dd2CDb1d32Ac467353a"
ADMIN_USERNAME="admin"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="H_`:euNo0[6!(n/x4a#u"

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