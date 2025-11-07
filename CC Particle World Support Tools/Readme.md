
<img width="1144" height="741" alt="CC Particle World Support Tools" src="https://github.com/user-attachments/assets/335316fa-8740-4ed8-8bac-745bbab8e97e" />
<h1>CC Particle World Preset UI v1.0.0</h1>

<p><strong>After Effects 用スクリプト</strong><br>
CC Particle World エフェクトの設定をプリセットとして保存・適用できる管理ツールです。灰色（非編集）項目も「[UNREADABLE]」として記録され、完全な構成情報を保持します。</p>

<hr>

<h2>■ 機能概要</h2>
<ul>
  <li>現在の CC Particle World 設定をプリセットとして保存</li>
  <li>保存済みプリセットの一覧管理（選択・削除・リネーム）</li>
  <li>TXT ファイルへのエクスポート／インポート</li>
  <li>デフォルト「火の粉」プリセットを搭載</li>
  <li>「灰色項目（非編集）」も [UNREADABLE] として保存</li>
</ul>

<hr>

<h2>■ 使用方法</h2>

<h3>1. 起動</h3>
<p>After Effects の「スクリプト」メニューから実行。<br>
パネルが開かない場合はスクリプトフォルダに配置して再起動してください。</p>

<h3>2. 設定を保存</h3>
<ol>
  <li>コンポジションをアクティブにする</li>
  <li>CC Particle World が適用されたレイヤーを選択</li>
  <li><strong>「現在の設定を記憶」</strong>ボタンをクリック</li>
  <li>プリセット名を入力して OK</li>
</ol>
<p>スクリプトはエフェクト内の全プロパティを走査し、<br>値が取得できない項目も「[UNREADABLE]」として記録します。</p>

<h3>3. プリセットの適用</h3>
<ol>
  <li>適用先のレイヤーを選択</li>
  <li>一覧からプリセットを選択</li>
  <li><strong>「設定適用」</strong>ボタンをクリック</li>
</ol>
<p>または、リスト項目を<strong>ダブルクリック</strong>しても適用可能です。<br>
何も選択していない場合はデフォルトプリセット「火の粉」を適用します。</p>

<h3>4. プリセットの管理</h3>
<ul>
  <li><strong>記憶削除</strong>：選択中プリセットを削除</li>
  <li><strong>リネーム</strong>：選択中プリセット名を変更</li>
  <li><strong>設定保存先</strong>：保存ファイルの保存先フォルダを変更</li>
</ul>

<h3>5. エクスポート／インポート</h3>
<p>
プリセットをテキスト形式（UTF-8 BOM付き）で出力・読み込みできます。<br>
他環境や他ユーザーとの共有が可能です。
</p>
<ul>
  <li><strong>エクスポート(.TXT)</strong>：選択中プリセットをファイルに書き出す</li>
  <li><strong>インポート(.TXT)</strong>：他のプリセットファイルを読み込む</li>
</ul>

<hr>

<h2>■ 保存形式</h2>
<p>保存ファイルは <code>CCParticleWorldPresets.txt</code> としてスクリプトと同フォルダ、<br>
または書き込み不可の場合はデスクトップに生成されます。</p>

<pre>
[プリセット名]
プロパティ名=値;プロパティ名=値;...
---
</pre>
<p>例：</p>
<pre>
[火の粉]
Birth Rate=0.1;Longevity (sec)=3;Color Map=2;...
---
</pre>

<hr>

<h2>■ 特徴的な仕様</h2>
<ul>
  <li>取得できない（灰色）項目は <code>[UNREADABLE]</code> として保存</li>
  <li>整数扱いすべき項目（例：Type, Mode, Color Map）は整数で保持</li>
  <li>Effect Camera グループの <code>Distance</code> や <code>Type</code> は自動検出して正しく保存／適用</li>
  <li>UTF-8(BOM)で読み書きするため日本語環境でも安全</li>
</ul>

<hr>

<h2>■ デフォルトプリセット「火の粉」</h2>
<p>初回起動時に自動作成される基本プリセットです。<br>
シンプルな炎・火花系表現をベースに設定されています。</p>

<hr>

<h2>■ 保存ファイルの場所変更</h2>
<p>UI 下部の「設定保存先」ボタンでフォルダ選択可能。<br>
指定先に <code>CCParticleWorldPresets.txt</code> が生成・更新されます。</p>

<hr>

<h2>■ 注意事項</h2>
<ul>
  <li>CC Particle World のみ対応。他エフェクトは非対応。</li>
  <li>After Effects 2020 以降推奨（ExtendScript 実行環境）</li>
  <li>Effect Camera 検出に依存するため、構造を大幅に変更した場合は値反映に失敗することがあります。</li>
</ul>

<hr>

<h2>■ ファイル構成</h2>
<pre>
CC_ParticleWorldPreset.jsx   ← 本体スクリプト
CCParticleWorldPresets.txt   ← 保存プリセットデータ
</pre>

<hr>

<h2>■ 作者</h2>
<p>Developed by <strong>@digimonkey_jp</strong><br>
Tested: Adobe After Effects 2022+</p>

<hr>

<h2>■ バージョン履歴</h2>
<ul>
  <li>v1.0.0：初版公開。保存・読込・適用・管理・灰色項目記録対応。</li>
</ul>
<hr>
<hr>
<h1>Universal Key Generator v1.0.0</h1>

<p><strong>After Effects 用スクリプト</strong><br>
選択レイヤーの「選択中のプロパティ」に対して、指定パターンで数値キーを自動生成します。プロパティ種別の判定は行わず、数値が設定できるものを対象にします。UI タイトルは内部的に <code>BirthRate Key Generator</code> と表示されます。</p>

<hr>

<h2>機能概要</h2>
<ul>
  <li>現在アクティブなコンポ上で、選択レイヤーの「選択中のプロパティ」にキーを一括生成</li>
  <li>開始フレームはタイムスライダー位置</li>
  <li>1ループ内のキー配列を「0 → val × count → 0」で作成</li>
  <li>ループを指定回数繰り返し、各ループ間に任意フレームの間隔を挿入</li>
  <li>対象プロパティの既存キーは生成前に全削除</li>
  <li>通知は無音ダイアログ（OK のみ）</li>
</ul>

<hr>

<h2>前提</h2>
<ul>
  <li>対象: After Effects（ExtendScript 実行環境）。AE 2022+ 推奨</li>
  <li>コンポをアクティブにし、レイヤーを選択し、さらに「プロパティ」自体を選択して実行</li>
  <li>数値を受け付けないプロパティは対象外</li>
</ul>

<hr>

<h2>UI 項目</h2>
<table>
  <thead>
    <tr><th>ラベル</th><th>説明</th><th>初期値</th></tr>
  </thead>
  <tbody>
    <tr><td>粒の量 (BirthRate)</td><td>キーオン時に設定する値 <code>val</code></td><td>0.004</td></tr>
    <tr><td>1ループのキー数</td><td><code>val</code> を連続で打つフレーム数 <code>count</code></td><td>3</td></tr>
    <tr><td>繰り返し回数</td><td>ループの反復回数 <code>repeat</code></td><td>5</td></tr>
    <tr><td>間隔フレーム</td><td>各ループ終了後に空けるフレーム数 <code>interval</code></td><td>10</td></tr>
    <tr><td>実行</td><td>キー生成を開始</td><td>—</td></tr>
  </tbody>
</table>

<p>上部の説明欄には参考値を表示します（例：Line 0.0039 / Other 0.0313）。</p>

<hr>

<h2>使い方</h2>
<ol>
  <li>コンポをアクティブにする</li>
  <li>レイヤーを選択する</li>
  <li>タイムスライダーを開始位置へ移動</li>
  <li>レイヤー内でキーを打ちたいプロパティを選択（複数可）</li>
  <li>UI の数値を設定し、<strong>実行</strong></li>
</ol>

<hr>

<h2>キー生成ロジック</h2>
<p>フレーム単位で処理します（<code>fd = comp.frameDuration</code>）。開始フレームは <code>startF = floor(time/fd)</code>。</p>

<ol>
  <li>対象プロパティの既存キーを全削除</li>
  <li>以下を <code>repeat</code> 回繰り返す（<code>curF</code> はループごとの開始フレーム）
    <ol>
      <li><code>curF</code> に値 0 のキー</li>
      <li><code>i = 1..count</code> に対して <code>curF + i</code> に値 <code>val</code> のキー</li>
      <li><code>endF = curF + count + 1</code> に値 0 のキー</li>
      <li><code>curF = endF + interval</code> に更新</li>
    </ol>
  </li>
</ol>

<p><strong>1ループ内の時系列</strong>：<code>[0] → val × count → [0]</code></p>

<hr>

<h2>例</h2>
<p>設定：<code>val=0.004</code>、<code>count=3</code>、<code>repeat=2</code>、<code>interval=10</code>、開始フレーム <code>s</code>。</p>
<ul>
  <li>ループ1：<code>s:0</code> → <code>s+1:0.004</code> → <code>s+2:0.004</code> → <code>s+3:0.004</code> → <code>s+4:0</code></li>
  <li>間隔：<code>+10</code>（キー追加なし）</li>
  <li>ループ2：<code>s+15:0</code> → <code>s+16:0.004</code> → <code>s+17:0.004</code> → <code>s+18:0.004</code> → <code>s+19:0</code></li>
</ul>

<hr>

<h2>アラート仕様</h2>
<ul>
  <li>コンポ未アクティブ、選択プロパティなし、入力値不正などはダイアログで通知</li>
  <li>完了時は開始フレームを示すダイアログを表示</li>
</ul>

<hr>

<h2>注意事項</h2>
<ul>
  <li>「プロパティ」を選択してください。プロパティグループ選択は対象外</li>
  <li>数値設定不可のプロパティは処理しません</li>
  <li>既存キーは全削除されます。必要なら実行前に複製や保存を推奨</li>
  <li>複数プロパティ選択時は同一パターンをまとめて適用</li>
</ul>

<hr>

<h2>インストール</h2>
<ol>
  <li>スクリプトファイル（<code>.jsx</code>）を AE のスクリプトフォルダへ配置</li>
  <li>AE を再起動</li>
  <li><em>ファイル &gt; スクリプト</em> から実行</li>
</ol>

<hr>

<h2>既知の挙動</h2>
<ul>
  <li>UI タイトルは内部的に「BirthRate Key Generator」を表示</li>
  <li>処理はフレームベース。タイムラインのフレームレートに依存</li>
</ul>

<hr>

<h2>バージョン</h2>
<ul>
  <li>v1.0.0 初版</li>
</ul>

<hr>

<h2>著作者</h2>
<p>@digimonkey_jp</p>
