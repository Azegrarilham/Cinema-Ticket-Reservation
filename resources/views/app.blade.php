<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Preload hints for critical resources -->
        <link rel="preload" href="{{ asset('fonts/your-main-font.woff2') }}" as="font" type="font/woff2" crossorigin>
        <link rel="preload" as="style" href="{{ asset('build/assets/app.css') }}">
        <link rel="preload" as="script" href="{{ asset('build/assets/app.js') }}">

        <!-- Early connection hints -->
        <link rel="dns-prefetch" href="{{ config('app.url') }}">
        <link rel="preconnect" href="{{ config('app.url') }}" crossorigin>

        <!-- Meta tags for better SEO and social sharing -->
        <meta name="description" content="Book your cinema tickets online with ease">
        <meta property="og:title" content="{{ config('app.name', 'Laravel') }}">
        <meta property="og:description" content="Book your cinema tickets online with ease">
        <meta property="og:image" content="{{ asset('images/og-image.jpg') }}">
        <meta property="og:type" content="website">

        <!-- Favicon -->
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia

        <!-- Instant.Page for faster subsequent page loads -->
        <script src="//instant.page/5.2.0" type="module" integrity="sha384-jnZyxPjiipYXnSU0ygqeac2q7CVYMbh84q0uHVRRxEtvFPiQYbXWUorga2aqZJ0n"></script>
    </body>
</html>
