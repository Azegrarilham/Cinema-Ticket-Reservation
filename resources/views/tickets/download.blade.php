<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Movie Ticket - {{ $reservation->screening->film->title }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .ticket-container {
            max-width: 800px;
            margin: 40px auto;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .ticket-header {
            background: linear-gradient(to right, #e31937, #b71c1c);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .ticket-logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .ticket-title {
            font-size: 28px;
            margin: 10px 0;
        }
        .ticket-body {
            padding: 20px;
        }
        .ticket-section {
            margin-bottom: 25px;
        }
        .ticket-section-title {
            font-size: 18px;
            font-weight: bold;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            margin-bottom: 10px;
            color: #b71c1c;
        }
        .ticket-detail {
            display: flex;
            margin-bottom: 8px;
        }
        .ticket-label {
            width: 140px;
            font-weight: bold;
        }
        .ticket-value {
            flex: 1;
        }
        .ticket-confirmation {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            margin: 20px 0;
        }
        .confirmation-code {
            font-size: 24px;
            font-weight: bold;
            color: #b71c1c;
            letter-spacing: 2px;
        }
        .ticket-footer {
            background-color: #f9f9f9;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .barcode {
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background-color: #fff;
            border-radius: 5px;
        }
        .css-barcode {
            display: inline-block;
            margin: 1em 0;
        }
        .css-barcode-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 80px;
        }
        .css-barcode-line {
            width: 2px;
            height: 80px;
            background: #000;
            display: inline-block;
            margin-right: 1px;
        }
        .css-barcode-line.thin {
            width: 1px;
        }
        .css-barcode-line.medium {
            width: 2px;
        }
        .css-barcode-line.thick {
            width: 3px;
        }
        .css-barcode-line.space {
            width: 1px;
            background: transparent;
        }
        .print-button {
            display: block;
            margin: 20px auto;
            background: #b71c1c;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        .print-button:hover {
            background: #e31937;
        }
        @media print {
            body {
                background-color: white;
            }
            .ticket-container {
                box-shadow: none;
                margin: 0;
                max-width: 100%;
            }
            .print-button {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="ticket-container">
        <div class="ticket-header">
            <div class="ticket-logo">CINEVERSE</div>
            <h1 class="ticket-title">{{ $reservation->screening->film->title }}</h1>
        </div>

        <div class="ticket-body">
            <div class="ticket-confirmation">
                <div>Confirmation Code</div>
                <div class="confirmation-code">{{ $reservation->confirmation_code }}</div>
            </div>

            <div class="ticket-section">
                <div class="ticket-section-title">Screening Details</div>
                <div class="ticket-detail">
                    <div class="ticket-label">Date:</div>
                    <div class="ticket-value">{{ \Carbon\Carbon::parse($reservation->screening->start_time)->format('l, F j, Y') }}</div>
                </div>
                <div class="ticket-detail">
                    <div class="ticket-label">Time:</div>
                    <div class="ticket-value">{{ \Carbon\Carbon::parse($reservation->screening->start_time)->format('g:i A') }}</div>
                </div>
                <div class="ticket-detail">
                    <div class="ticket-label">Room:</div>
                    <div class="ticket-value">{{ $reservation->screening->room }}</div>
                </div>
            </div>

            <div class="ticket-section">
                <div class="ticket-section-title">Seat Information</div>
                <div class="ticket-detail">
                    <div class="ticket-label">Seats:</div>
                    <div class="ticket-value">{{ $seatsList }}</div>
                </div>
                <div class="ticket-detail">
                    <div class="ticket-label">Number of Seats:</div>
                    <div class="ticket-value">{{ count($reservation->seats) }}</div>
                </div>
            </div>

            <div class="ticket-section">
                <div class="ticket-section-title">Price Information</div>
                <div class="ticket-detail">
                    <div class="ticket-label">Price per Seat:</div>
                    <div class="ticket-value">${{ number_format($reservation->screening->price, 2) }}</div>
                </div>
                <div class="ticket-detail">
                    <div class="ticket-label">Total Amount:</div>
                    <div class="ticket-value">${{ number_format(count($reservation->seats) * $reservation->screening->price, 2) }}</div>
                </div>
            </div>

            @if($reservation->guest_name || $reservation->user_id)
            <div class="ticket-section">
                <div class="ticket-section-title">Customer Information</div>
                <div class="ticket-detail">
                    <div class="ticket-label">Name:</div>
                    <div class="ticket-value">{{ $userName ?? $reservation->guest_name ?? 'Registered User' }}</div>
                </div>
                @if(isset($userEmail) || $reservation->guest_email)
                <div class="ticket-detail">
                    <div class="ticket-label">Email:</div>
                    <div class="ticket-value">{{ $userEmail ?? $reservation->guest_email }}</div>
                </div>
                @endif
                @if($reservation->guest_phone)
                <div class="ticket-detail">
                    <div class="ticket-label">Phone:</div>
                    <div class="ticket-value">{{ $reservation->guest_phone }}</div>
                </div>
                @endif
            </div>
            @endif

            <div class="barcode">
                <div class="ticket-section-title">Scan for Entry</div>
                <div class="css-barcode">
                    <div class="css-barcode-container">
                        @php
                            // Simple pattern generation based on confirmation code
                            $code = $reservation->confirmation_code;
                            $codeHash = md5($code);
                            $barPattern = [];

                            // Generate pattern from the hash
                            for($i = 0; $i < strlen($codeHash); $i++) {
                                $char = $codeHash[$i];
                                $value = hexdec($char);

                                if($value < 4) {
                                    $barPattern[] = 'thin';
                                } elseif($value < 8) {
                                    $barPattern[] = 'thin';
                                    $barPattern[] = 'space';
                                } elseif($value < 12) {
                                    $barPattern[] = 'medium';
                                } else {
                                    $barPattern[] = 'thick';
                                    $barPattern[] = 'space';
                                }
                            }
                        @endphp

                        @foreach($barPattern as $type)
                            <div class="css-barcode-line {{ $type }}"></div>
                        @endforeach
                    </div>
                </div>
                <div style="margin-top: 8px; font-size: 12px; color: #666;">{{ $reservation->confirmation_code }}</div>
            </div>
        </div>

        <div class="ticket-footer">
            <p>This ticket is your admission pass. Please present this ticket at the entrance.</p>
            <p>© {{ date('Y') }} CineVerse. All rights reserved.</p>
        </div>
    </div>

    <button class="print-button" onclick="window.print()">Print Ticket</button>
</body>
</html>
