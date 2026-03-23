echo PORT=8000
echo SECRET=\"$(cat /dev/random | tr -cd "[:graph:]" | head -c64)\"
echo PEPPER=\"$(cat /dev/random | tr -cd "[:xdigit:]" | head -c64)\"
echo ADMIN_USERNAME=\"admin\"
echo ADMIN_EMAIL=\"admin@example.com\"
echo ADMIN_PASSWORD=\"$(cat /dev/random | tr -cd "[:graph:]" | head -c20)\"