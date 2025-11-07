<h1>O_Tools v1.5.7a ドキュメント</h1>

<p>
After Effects 用 ScriptUI パネル。名前編集、タイムリマップ支援、レイヤー操作、重複整理、簡易シェイク、削除処理をタブで提供します。
本書の機能説明は同梱スクリプトの実装に基づきます。 :contentReference[oaicite:0]{index=0}
</p>

<h2>対象環境</h2>
<ul>
  <li>Adobe After Effects 2022 以降</li>
  <li>ExtendScript 実行環境</li>
  <li>ScriptUI パネルとしても単独ウインドウとしても動作</li>
</ul>

<h2>導入</h2>
<ol>
  <li><code>O-Tools-jp.jsx</code> を <code>Scripts</code> または <code>Scripts/ScriptUI Panels</code> に配置。</li>
  <li>AE を再起動。</li>
  <li>配置場所に応じて起動方法が異なる。
    <ul>
      <li>Scripts 配下: <strong>ファイル &gt; スクリプト &gt; スクリプトを実行</strong></li>
      <li>ScriptUI Panels 配下: <strong>ウィンドウ &gt; O_Tools</strong>（ドッキング可能）</li>
    </ul>
  </li>
</ol>

<h2>UI 構成</h2>
<p>タブは選択時にフル名、非選択時は短縮名で表示されます。</p>
<table>
  <thead>
    <tr><th>短縮</th><th>選択時ラベル</th><th>用途</th></tr>
  </thead>
  <tbody>
    <tr><td>Na</td><td>NameEd</td><td>プロジェクト項目とレイヤーの名前やコメントの一括取得・更新</td></tr>
    <tr><td>TR</td><td>TReMap</td><td>タイムリマップ操作とループ支援</td></tr>
    <tr><td>T1</td><td>Tools1</td><td>レイヤー並べ替え、コメント→テキスト、時間調整、作業エリア移動</td></tr>
    <tr><td>T2</td><td>Tools2</td><td>名前初期化、サイズ追記、コンポ中央表示</td></tr>
    <tr><td>Re</td><td>Remove</td><td>重複素材の検出と整理</td></tr>
    <tr><td>Sh</td><td>Shake</td><td>減衰シェイクの付与と各種削除処理</td></tr>
  </tbody>
</table>

<hr/>

<h2>タブ別機能</h2>

<h3>NameEd タブ</h3>
<ul>
  <li><strong>モード</strong>: <code>名前</code> / <code>コメント</code> を切替。</li>
  <li><code>取得</code>: プロジェクトパネルで選択中のアイテム名またはコメント、さらにアクティブコンポ内の選択レイヤー情報をテキスト欄に収集。</li>
  <li><code>更新</code>: テキスト欄の行を順に適用。選択アイテムや選択レイヤーへ名前またはコメントを書き戻し。</li>
  <li><code>置換</code>: 置換前後テキストを指定し、テキスト欄内を一括置換。</li>
</ul>
<p>備考: アイテムは <em>CompItem / FootageItem / FolderItem</em> に対応。行数が足りない場合は対応範囲のみ適用。</p>

<h3>TReMap タブ</h3>
<p>コマ抜きやループ構築など、タイムリマップ前提の操作を提供します。</p>
<ul>
  <li><code>コマ抜き</code>＋数値: 選択レイヤーにタイムリマップを初期化し、全フレームに停止キーを生成後、指定間引きでキーを残す。</li>
  <li><code>オフセット</code>＋数値: 選択中のタイムリマップで「選択キーの値」をフレーム数で平行移動。秒へ換算して加算。</li>
  <li><code>■-------</code>: 先頭1フレームを静止表示してループの起点にする。</li>
  <li><code>-------■</code>: 終端1フレーム静止。50F例の終端キーを1F前に再配置し、最後は静止でつなぐ設計。</li>
  <li><code>◆-----◆</code>: 2キー構成を作り <code>loopOut("cycle")</code> を適用。連番フッテージにも対応。</li>
  <li><code>◆--L-◆◆</code>: ソースコンポ側のマーカー名に「loop」または「l」を含むものを基準にループ区間を構築。</li>
</ul>
<p>注意: Null、ライト、カメラ、平面はガード。処理はアクティブコンポと選択レイヤーを対象。</p>

<h3>Tools1 タブ</h3>
<ul>
  <li><code>逆配置</code>: 選択レイヤーの順序を反転。</li>
  <li><code>文字変換</code>: テキストレイヤーのコメント文字列をソーステキストに反映し、レイヤー名をクリア。</li>
  <li><code>時間調整</code>＋<em>1文字あたりF</em>: テキスト長×指定フレーム数からレイヤーの出力点を再計算。</li>
  <li><code>コンポ時間調整</code>: 全レイヤーの最小 in と最大 out を元にコンポ長を再設定し、開始を0へそろえる。</li>
  <li><code>移動</code>: 選択レイヤーの開始を作業エリア先頭にそろえる。</li>
</ul>

<h3>Tools2 タブ</h3>
<ul>
  <li><code>初期化</code>:
    <ul>
      <li>チェックオン時: カメラを <code>Cam01..</code>、ライトを <code>Lit01..</code>、シェイプを <code>Shape01..</code>、ヌルを <code>Null01..</code> に採番。その他は空名。</li>
      <li>オフ時: ヌルと通常レイヤーのみ空名に初期化。カメラ等は維持。</li>
    </ul>
  </li>
  <li><code>サイズ追加/更新</code>: アイテム名やソース名末尾に <code>_幅*高</code> を追記。既存のサイズ表記は置換。</li>
  <li><code>中央表示</code>: コンポサイズを一時的に±1ピクセル変更して再描画を促し、ビューワの中央表示を実質トリガ。</li>
</ul>

<h3>Remove タブ</h3>
<p>重複素材の検出と統合を行います。対象フォルダを選び条件を指定。</p>
<ul>
  <li>条件:
    <ul>
      <li><code>サブフォルダを含める</code></li>
      <li><code>名前でチェック</code> または <code>名前でチェック(数字_-xX*＊は無視)</code></li>
      <li><code>大きさでチェック</code> 幅×高さ一致</li>
      <li><code>コンポを含める</code> 任意</li>
    </ul>
  </li>
  <li><code>調べる</code>: 条件に一致するキーで重複を集計し件数を表示。</li>
  <li><code>実行</code>: 先頭アイテムを正とし、使用箇所の <em>source</em> を順次差し替え。未使用の重複は削除。</li>
</ul>

<h3>Shake タブ</h3>
<p>減衰付きの位置シェイクと一括削除ツール。</p>
<ul>
  <li>シェイク:
    <ul>
      <li>軸: <code>X方向に揺れる</code> / <code>Y方向に揺れる</code></li>
      <li><code>移動幅</code> ピクセル最大値</li>
      <li><code>揺れる時間(フレーム)</code></li>
      <li><code>揺れを適用</code>: ランダム位相を持つ減衰オフセットをフレームごとに付与。終了で初期位置に復帰。</li>
    </ul>
  </li>
  <li>削除項目:
    <ul>
      <li><code>トランスフォーム削除</code> 位置 回転 スケール 不透明度 アンカーポイントのキーを除去</li>
      <li><code>エクスプレッション削除</code> 上記トランスフォームの式をクリア</li>
      <li><code>エフェクト削除</code> <code>ADBE Effect Parade</code> を空に</li>
      <li><code>マスク削除</code> <code>ADBE Mask Parade</code> を空に</li>
      <li><code>タイムリマップ削除</code> キー削除後に無効化</li>
      <li><code>削除</code> で実行</li>
    </ul>
  </li>
</ul>

<hr/>

<h2>操作の前提</h2>
<ul>
  <li>対象はアクティブコンポと選択レイヤー。プロジェクトパネル選択は NameEd と Remove で使用。</li>
  <li>各処理は <code>Undo</code> グループ化。</li>
  <li>ガード条件により不適切な対象はスキップまたは警告。</li>
</ul>

<h2>よくある質問</h2>
<details>
  <summary>連番フッテージでループ化できるか</summary>
  <p>はい。TReMap の <code>◆-----◆</code> は <em>FootageItem</em> の非静止かつ動画を判定し対応します。</p>
</details>
<details>
  <summary>コンポの中央表示は何をしているか</summary>
  <p>AE に専用 API が無いので、サイズを一時変更して再描画を促す方式です。</p>
</details>
<details>
  <summary>重複整理の差し替え範囲</summary>
  <p>全コンポを走査し、レイヤーの <code>source</code> 参照を置換します。未使用の重複は削除します。</p>
</details>

<h2>既知の制限</h2>
<ul>
  <li>NameEd の更新は行単位対応。行数不一致時は範囲のみ反映。</li>
  <li>シェイクは2D位置を前提。3Dレイヤーの回転やカメラには非対応。</li>
  <li>中央表示はビューワの実座標を制御するものではない。</li>
</ul>

<h2>トラブルシュート</h2>
<ul>
  <li>ボタンが無反応: コンポがアクティブか、レイヤー選択があるか確認。</li>
  <li>タイムリマップ系エラー: Null、ライト、カメラ、平面を選んでいないか確認。</li>
  <li>Remove が見つけない: 条件のチェック状態を確認。サイズや名称フィルタが絞り込み過ぎていないか確認。</li>
</ul>

<h2>ライセンスと表記</h2>
<ul>
  <li>スクリプト内ヘッダ表記に従う。</li>
  <li>本ドキュメントはスクリプトの現行挙動を記述。</li>
</ul>

