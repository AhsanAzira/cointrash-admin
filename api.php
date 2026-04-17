<?php
// Izinkan akses dari aplikasi Mobile dan Web (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

$conn = mysqli_connect("localhost", "root", "", "cointrash");

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Koneksi Database Gagal"]);
    exit;
}

$action = $_GET['action'] ?? '';

if ($action == 'get_prices') {
    $result = mysqli_query($conn, "SELECT id, name, price_per_kg FROM waste_types");
    echo json_encode(mysqli_fetch_all($result, MYSQLI_ASSOC));
}

if ($action == 'verify_user') {
    $search = mysqli_real_escape_string($conn, $_GET['search'] ?? '');
    $query = "SELECT id, NAME, email, phone FROM users 
              WHERE email = '$search' 
              OR phone = '$search' 
              OR NAME LIKE '%$search%' LIMIT 1";
    $result = mysqli_query($conn, $query);
    echo json_encode(mysqli_fetch_assoc($result));
}

if ($action == 'login' && $_SERVER['REQUEST_METHOD'] == 'POST') {
    // Menangkap data JSON dari Flutter
    $input = json_decode(file_get_contents('php://input'), true);
    $email = mysqli_real_escape_string($conn, $input['email'] ?? '');
    $password = mysqli_real_escape_string($conn, $input['password'] ?? '');

    // Cek email dan password
    $query = "SELECT id, NAME, email FROM users WHERE email = '$email' AND PASSWORD = '$password' LIMIT 1";
    $result = mysqli_query($conn, $query);
    $user = mysqli_fetch_assoc($result);
    
    if ($user) {
        echo json_encode(["status" => "success", "user" => $user]);
    } else {
        echo json_encode(["status" => "error", "message" => "Email atau Password salah"]);
    }
}

if ($action == 'register' && $_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $name = mysqli_real_escape_string($conn, $input['name']);
    $email = mysqli_real_escape_string($conn, $input['email']);
    $password = mysqli_real_escape_string($conn, $input['password']); 

    $sql = "INSERT INTO users (NAME, email, PASSWORD, role) VALUES ('$name', '$email', '$password', 'user')";
    
    if (mysqli_query($conn, $sql)) {
        $user_id = mysqli_insert_id($conn);
        mysqli_query($conn, "INSERT INTO wallets (user_id, balance) VALUES ('$user_id', 0)");
        echo json_encode(["status" => "success", "user_id" => $user_id]);
    } else {
        echo json_encode(["status" => "error", "message" => mysqli_error($conn)]);
    }
}

if ($action == 'save_transaction' && $_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $user_id = mysqli_real_escape_string($conn, $input['user_id']);
    $waste_type_id = mysqli_real_escape_string($conn, $input['waste_type_id']);
    $weight = mysqli_real_escape_string($conn, $input['weight']);
    $coins = mysqli_real_escape_string($conn, $input['coins']);

    $sql = "INSERT INTO transactions (user_id, waste_type_id, weight, coins, status) 
            VALUES ('$user_id', '$waste_type_id', '$weight', '$coins', 'success')";
    
    if (mysqli_query($conn, $sql)) {
        mysqli_query($conn, "UPDATE wallets SET balance = balance + $coins WHERE user_id = '$user_id'");
        echo json_encode(["status" => "success", "message" => "Transaksi Berhasil"]);
    } else {
        echo json_encode(["status" => "error", "message" => mysqli_error($conn)]);
    }
}

if ($action == 'get_history') {
    $user_id = mysqli_real_escape_string($conn, $_GET['user_id'] ?? '');
    
    $sql = "SELECT t.*, u.NAME as user_name, u.phone as user_phone, w.name as waste_name 
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            JOIN waste_types w ON t.waste_type_id = w.id";
            
    if (!empty($user_id)) {
        $sql .= " WHERE t.user_id = '$user_id'";
    }
    
    $sql .= " ORDER BY t.created_at DESC";
    
    $result = mysqli_query($conn, $sql);
    echo json_encode(mysqli_fetch_all($result, MYSQLI_ASSOC));
}

if ($action == 'get_waste_types') {
    $result = mysqli_query($conn, "SELECT * FROM waste_types");
    echo json_encode(mysqli_fetch_all($result, MYSQLI_ASSOC));
}

mysqli_close($conn);
?>