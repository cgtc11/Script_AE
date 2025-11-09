
<section id="digimonkey-toolkits">
  <h1>AE / DCC ツールコレクション概要</h1>
  <p>このリポジトリは After Effects を中心としたワークフロー用スクリプト群とユーティリティをまとめています。各フォルダは独立して利用できます。</p>

  <hr>

  <h2 id="ccparticleworldbirthrate">CCParticleWorldBirthRate</h2>
  <p><strong>目的:</strong> <code>CC Particle World</code> の <code>Birth Rate</code> をはじめとする選択プロパティへキー列を一括生成し、テスト用の発生量カーブをすばやく作る。</p>
  <ul>
    <li><strong>想定ファイル:</strong> <code>BirthRate Key Generator.jsx</code> など</li>
    <li><strong>主な機能:</strong>
      <ul>
        <li>選択中レイヤーの選択中プロパティにキーフレームを自動打鍵</li>
        <li>プリセットカーブの適用と値レンジの一括スケール</li>
        <li>UI パネルから即時プレビュー</li>
      </ul>
    </li>
    <li><strong>使い方:</strong>
      <ol>
        <li>対象レイヤーで <em>CC Particle World</em> を有効化し、値を付けたいプロパティを選択</li>
        <li>本スクリプトを実行し、UI でカーブを選択して <em>Apply</em></li>
      </ol>
    </li>
    <li><strong>テスト環境:</strong> After Effects 2022 以降</li>
  </ul>

  <h2 id="ccparticleworldpresets">CCParticleWorldPresets</h2>
  <p><strong>目的:</strong> <code>CC Particle World</code> 一式の設定プリセットを管理し、保存・読み込み・一括適用を行う。</p>
  <ul>
    <li><strong>想定ファイル:</strong> <code>CCParticleWorldPresets.jsx</code>、<code>presets/*.json</code></li>
    <li><strong>主な機能:</strong>
      <ul>
        <li>エフェクト全パラメータの JSON エクスポート/インポート</li>
        <li>複数レイヤーへのバッチ適用</li>
        <li>既存キー保持の上書き/無視の切替</li>
      </ul>
    </li>
    <li><strong>使い方:</strong>
      <ol>
        <li>調整済みレイヤーを選択して <em>Save</em> で JSON へ保存</li>
        <li>適用先レイヤーを選択して <em>Load</em> または <em>Apply to Selected</em></li>
      </ol>
    </li>
  </ul>

  <h2 id="copipe">CoPiPe</h2>
  <p><strong>目的:</strong> 依存関係を縮小しつつコンポやレイヤーを別プロジェクトへ持ち回りするための「コピー・ペースト中継」ツール。</p>
  <ul>
    <li><strong>代表スクリプト:</strong> <code>CoPiPe.jsx</code></li>
    <li><strong>要点:</strong>
      <ul>
        <li><em>Copy</em>: 依存縮小 → デスクトップに <code>CoPiPe.aepx</code> 保存 → 元プロジェクトを Undo で復帰</li>
        <li><em>Paste</em>: <code>CoPiPe.aepx</code> を読み込み、直下フォルダを <code>CoPiPe</code> に整理、レイヤーは <code>__CoPiPe__</code> から順序維持で貼付</li>
        <li>オプションで中継 AEPX を削除</li>
      </ul>
    </li>
    <li><strong>注意:</strong> レイヤー貼付時にアクティブコンポが切り替わる場合があるため、貼付先を事前にアクティブにしておく。</li>
  </ul>

  <h2 id="fxcopypastetool">FxCopyPasteTool</h2>
  <p><strong>目的:</strong> エフェクトの値・キー・式をコピーし、同種エフェクトへ一括貼付。異種の場合は置換モードで削除→追加→適用を実行。</p>
  <ul>
    <li><strong>代表スクリプト:</strong> <code>FxCopyPasteTool.jsx</code></li>
    <li><strong>主な機能:</strong>
      <ul>
        <li>選択エフェクトからのプロパティ全取得（キーとエクスプレッション対応）</li>
        <li>スコープ選択：プロジェクト全体 / コンポ選択 / 現在レイヤー</li>
        <li>同名末尾の番号付きエフェクトを同一種として判定しマルチ適用</li>
      </ul>
    </li>
    <li><strong>既知の制約:</strong> 一部サードパーティ効果の非公開プロパティは移行不可。</li>
  </ul>

  <h2 id="o-tools">O-Tools</h2>
  <p><strong>目的:</strong> よく使う AE 作業をまとめた多機能パネル。名称編集、タイムリマップ、整列、削除、シェイプ操作などをタブで提供。</p>
  <ul>
    <li><strong>代表スクリプト:</strong> <code>O_Tools.jsx</code>（ScriptUI パネル対応）</li>
    <li><strong>タブ例:</strong> <code>Na</code> / <code>TR</code> / <code>T1</code> / <code>T2</code> / <code>Re</code> / <code>Sh</code> / <code>New</code></li>
    <li><strong>備考:</strong> AE 2025 でも動作確認済みの構成あり。</li>
  </ul>

  <h2 id="shapedetriming">ShapeDeTriming</h2>
  <p><strong>目的:</strong> シェイプレイヤーのトリミングと編集を支援するツール群。トリミング後の再配置や数値入力を簡素化。</p>
  <ul>
    <li><strong>代表スクリプト:</strong> <code>ShapeDeTriming.jsx</code> など</li>
    <li><strong>主な機能:</strong>
      <ul>
        <li>トリミングした素材の元コンポ座標への再配置（<code>Xi</code>/<code>Yi</code> 入力）</li>
        <li>移動量と新サイズからのオフセット計算</li>
      </ul>
    </li>
  </ul>

  <hr>

  <h2 id="install">インストール</h2>
  <ol>
    <li>各フォルダ内の <code>.jsx</code> または <code>.jsxbin</code> を <code>After Effects &gt; Scripts</code> もしくは <code>Scripts/ScriptUI Panels</code> に配置</li>
    <li>パネル型は <em>ウィンドウ &gt; エクステンション</em> ではなく <em>ウィンドウ</em> メニュー内に表示</li>
    <li>初回は <em>編集 &gt; 環境設定 &gt; スクリプトとエクスプレッション</em> で「スクリプトによるファイルへの書き込みとネットワークへのアクセスを許可」を有効化</li>
  </ol>

  <h2 id="usage">基本的な使い方</h2>
  <ul>
    <li>対象コンポを開く</li>
    <li>必要に応じてレイヤーやエフェクトを選択</li>
    <li>該当ツールを実行し、UI 指示に従う</li>
  </ul>

  <h2 id="notes">ライセンス・注意</h2>
  <ul>
    <li>各サードパーティ効果の内部仕様変更により挙動が変わる場合がある</li>
    <li>実運用前に複製プロジェクトで検証すること</li>
  </ul>

  <h2 id="changelog">更新履歴の記載例</h2>
  <pre><code>&lt;ul&gt;
  &lt;li&gt;2025-11-10: 初回公開。各フォルダの概要を README に統合。&lt;/li&gt;
&lt;/ul&gt;</code></pre>

  <h2 id="support">問い合わせ</h2>
  <p>Issue へ再現手順と AE バージョン、OS、使用エフェクト名を記載してください。</p>
</section>
