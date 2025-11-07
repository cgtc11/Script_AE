
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
