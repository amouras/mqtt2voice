echo "Executando: sudo systemctl stop mqtt2voice.service"
sudo systemctl stop mqtt2voice.service
echo "Executando: npm i"
npm i
echo "Executando: git pull"
git pull
echo "Executando: sudo systemctl start mqtt2voice.service"
sudo systemctl start mqtt2voice.service
echo "Executando: sudo journalctl -u mqtt2voice.service -f"
sudo journalctl -u mqtt2voice.service -f