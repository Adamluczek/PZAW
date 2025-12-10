Projekt realizuje prosty serwer HTTP stworzony w Node.js z wykorzystaniem frameworka express i silnika szablonów EJS.
Tematem projektu jest aplikacja quizowa o wiedzy w dziedzinie NBA.
Użytkownik odpowiada na pytania po czym może dodać swój wynik do bnazy danych
Przez 15 minut od wejścia na strone ma on możliwość edycj swojej nazy przy wyniku lub kompletnego usunięcia 

Aby uruchomć projekt:
1. Sklonowanie repozytorium i przejscie do folderu z quizem
git clone https://github.com/Adamluczek/PZAW.git
cd projekt03
2. Zainstalowanie zależności 
npm install
3. Stworzenie i zapełnienie bazy danych 
node database/populatedb.js
4. Uruchomienie serwera 
node index.js
5. Otwarcie aplikacji w przeglądarce
http://localhost:8000