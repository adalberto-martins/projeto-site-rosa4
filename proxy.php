<?php
// proxy.php — Encaminha o POST do formulário ao n8n Cloud

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Responde rapidamente a requisições de verificação CORS (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Lê o corpo da requisição vinda do site
$data = file_get_contents("php://input");

// Envia para o webhook público do n8n Cloud
$ch = curl_init("https://rosaunhascabelo.app.n8n.cloud/webhook/agendar");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);

$response = curl_exec($ch);
curl_close($ch);

// Retorna a resposta do n8n ao navegador
echo $response;
