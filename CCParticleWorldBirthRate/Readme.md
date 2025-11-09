
<h1>CCParticleWorldBirthRate v1.0.0</h1>

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
