<!doctype html>
<html lang="vi">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Import Pallet</title>
    <style>
        :root {
            --bg: #f6f8fb;
            --card: #ffffff;
            --muted: #6b7280;
            --accent: #2563eb;
            --danger: #dc2626;
            --radius: 12px;
            --shadow: 0 6px 20px rgba(16, 24, 40, 0.08);
        }

        * {
            box-sizing: border-box
        }

        body {
            margin: 0;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
            background: linear-gradient(180deg, #f8fbff 0%, var(--bg) 100%);
            color: #111827;
            padding: 32px;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            min-height: 100vh;
        }

        .container {
            width: 100%;
            max-width: 920px;
            background: var(--card);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            padding: 22px;
        }

        h1 {
            font-size: 20px;
            margin: 0 0 6px
        }

        p.lead {
            margin: 0 0 18px;
            color: var(--muted);
            font-size: 14px
        }

        .import-area {
            border: 2px dashed rgba(37, 99, 235, 0.12);
            border-radius: 10px;
            padding: 26px;
            text-align: center;
            transition: background .12s, border-color .12s;
            background: linear-gradient(180deg, rgba(37, 99, 235, 0.02), transparent);
        }

        .import-area.dragover {
            background: rgba(37, 99, 235, 0.06);
            border-color: var(--accent);
        }

        .import-area .icon {
            font-size: 36px;
            margin-bottom: 8px;
            color: var(--accent);
        }

        .btn {
            display: inline-block;
            padding: 10px 16px;
            border-radius: 10px;
            background: var(--accent);
            color: white;
            text-decoration: none;
            cursor: pointer;
            font-weight: 600;
            margin-top: 10px;
        }

        .btn.secondary {
            background: transparent;
            color: var(--accent);
            border: 1px solid rgba(37, 99, 235, 0.12);
        }

        .hint {
            color: var(--muted);
            font-size: 13px;
            margin-top: 6px
        }

        .files {
            margin-top: 18px;
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
        }

        .file-row {
            display: flex;
            gap: 12px;
            align-items: center;
            padding: 10px 12px;
            border-radius: 10px;
            background: #fbfdff;
            border: 1px solid rgba(15, 23, 42, 0.03);
        }

        .thumb {
            width: 56px;
            height: 56px;
            flex: 0 0 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            overflow: hidden;
            background: #f3f4f6;
            color: var(--muted);
            font-size: 12px;
        }

        .file-meta {
            flex: 1;
            min-width: 0
        }

        .file-name {
            font-weight: 600;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis
        }

        .file-sub {
            font-size: 12px;
            color: var(--muted);
            margin-top: 3px
        }

        .progress {
            height: 8px;
            background: #eef2ff;
            border-radius: 999px;
            overflow: hidden;
            margin-top: 8px;
            width: 100%;
        }

        .progress>i {
            display: block;
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #3b82f6, #60a5fa);
        }

        .controls {
            display: flex;
            gap: 8px;
            margin-top: 16px;
            justify-content: flex-end;
        }

        .note {
            font-size: 13px;
            color: var(--muted);
            margin-top: 12px
        }

        .error {
            color: var(--danger);
            font-weight: 600;
            font-size: 13px
        }

        /* responsive */
        @media (max-width:560px) {
            body {
                padding: 16px
            }

            .container {
                padding: 16px
            }

            .file-row {
                flex-direction: row
            }
        }
    </style>
</head>

<body>
    <main class="container" role="main" aria-labelledby="title">
        <h1 id="title">Import file</h1>
        <form action="" method="post" enctype="multipart/form-data">
            @csrf
            <section class="import-area" id="dropzone" tabindex="0" aria-label="Vùng kéo thả file">
                <div class="icon">📁</div>
                <div>
                    <span id="file-name"></span>
                </div>
                <label class="btn" for="fileInput" style="margin-top:10px">Chọn file</label>
                <input id="fileInput" name='file' type="file" accept=".xlsx,.xls" style="display:none" />
            </section>
            <div>
                <select name="factory" style="width: 200px;">
                    <option value="TB" >TB</option>
                    <option value="YS" selected>YS</option>
                </select>
            </div>

            <div class="files" id="fileList" aria-live="polite"></div>

            <div class="controls">
                <button class="btn" id="uploadBtn" type="submit">Upload</button>
            </div>
        </form>
    </main>

    <script>
        let fileElement = document.getElementById('fileInput');
        let fileNameElement = document.getElementById('file-name');

        
        fileElement.addEventListener('change', e => {
            let file =e.target.files[0];
            if(!file) return;
            let filename = file.name;
            fileNameElement.innerHTML = filename;
        })
    </script>
</body>

</html>