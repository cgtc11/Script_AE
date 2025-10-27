Download [CoPiPe.zip](https://github.com/user-attachments/files/23167371/CoPiPe.zip)</br>
</br>
<img width="206" height="164" alt="copipe" src="https://github.com/user-attachments/assets/cd40701b-c91c-49c4-9000-117024de2f64" /></br>
</br>
■CoPiPe.jsx v1.0 説明■</br>
選択中のコンポまたはレイヤーだけを依存関係ごとAEPXに一時保存し、別起動のAEプロジェクトへ安全に貼り付ける。</br>
</br>
■仕組み■</br>
Copy</br>
対象を起点に依存アイテムを走査し、「必要なもの以外」を一時的に削除。</br>
Desktop/CoPiPe.aepx として保存（AEPX=XML形式）。</br>
直前の状態へUndoで復帰。</br>
</br>
Past</br>
CoPiPe.aepx をプロジェクトにインポート。</br>
直下フォルダ名を「CoPiPe」に統一。</br>
Layerモードは、AEPX内の __CoPiPe__ コンポから順序を保持して貼り付け。</br>
「Dell CoPiPe.aepx」チェックONなら取り込み後にAEPXを削除。</br>
</br>
■UI■</br>
Mode: Comp / Layer を選択。</br>
Dell CoPiPe.aepx: チェックONでペースト後にAEPX削除。OFFなら残す。</br>
Copy / Past: 上記動作を実行。</br>
</br>
■使い方■</br>
コンポを移す</br>
プロジェクトパネルで目的のコンポを選択。</br>
Mode を Comp にして Copy。</br>
転送先AEで同スクリプトを開き、Mode Comp → Past。</br>
レイヤーを移す</br>
タイムラインで貼りたいレイヤーを選択（複数可）。</br>
Mode を Layer にして Copy。</br>
転送先AEで貼り付け先コンポを開き、Mode Layer → Past。</br>
</br>
■依存の扱い■</br>
プリコンポ、フッテージ、ソリッドを再帰的に収集。</br>
不要アイテムはCopy中だけ除去し、Undoで元に戻す。</br>
レイヤーは copyToComp で順序維持。</br>
</br>
■注意点■</br>
外部フッテージはパスが変わると再リンクが必要。</br>
名前依存のエクスプレッションは、貼り付け先で名前が変わると手直しが必要な場合がある。</br>
AEPXが読み取り専用や権限で消せない場合、削除はスキップされる。</br>
</br>
ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー</br>
</br>
Download [ShapeDeTriming.zip](https://github.com/user-attachments/files/23167375/ShapeDeTriming.zip)</br>
</br>
<img width="262" height="564" alt="shapedetriming" src="https://github.com/user-attachments/assets/1a92fe97-d0dc-4d8f-aa15-b4773187f264" /></br>
</br>
■ShapeDeTriming.jsx v1.0 説明■</br>
シェイプレイヤー内の長方形パスを基準に、コンポをトリミングし、元位置に再配置できる編集支援ツール。</br>
</br>
■主な機能■</br>
情報取得：選択シェイプレイヤーのサイズ・位置・スケール等を表示。</br>
小数点以下切り捨て：選択レイヤーの</br>
レイヤー Transform（位置/アンカー/スケール/回転/不透明度、分離次元対応）</br>
シェイプの長方形パス（サイズ/位置/角丸）</br>
ベクタートランスフォーム（位置/アンカー/スケール/回転/不透明度）</br>
の小数を一括で床関数。キーフレームは変更しない。</br>
W/H編集 + 起点固定：9点から起点を選び、反対側を補正してサイズ変更。</br>
トリミング：親ヌルで全レイヤーをオフセット → コンポサイズを長方形に合わせて確定 → ヌル削除 → 時間を選択レイヤーに合わせて調整。</br>
配置（元位置復元）：トリミング結果から算出した Xi/Yi を、選択レイヤーの「位置」に適用して元の座標に戻す。複数レイヤー可。</br>
</br>
使い方</br>
前提：対象シェイプレイヤーのスケールは X=100, Y=100。</br>
対象レイヤーを選択 → 情報取得。</br>
必要なら 小数点以下切り捨て。</br>
必要なら X/Y や W/H を編集。起点は「W/H起点」で指定。</br>
コンポをトリミングを押す。情報欄に</br>
親ヌル移動 X/Y</br>
新コンポサイズ（NX/NY）</br>
自動計算された Xi/Yi</br>
が出る。Xi/Yi欄にも自動入力。</br>
元の位置に戻したいレイヤーを選択 → 配置。選択レイヤーの「位置」に Xi/Yi を適用。</br>
計算ロジック（復元）</br>
情報欄表示の「親ヌル移動 X/Y」は 表示値 = -moveX / -moveY。</br>
復元座標は</br>
Xi = -表示X + NX/2</br>
Yi = -表示Y + NY/2</br>
</br>
注意</br>
長方形パスは再帰探索で検出。新規シェイプレイヤー＞追加＞長方形にも対応。</br>
スケールが100,100以外だと位置計算は保証しない。</br>
切り捨てはボタン押下時のみ実行。キーフレーム付きプロパティは対象外。</br>
トリミング時、親ヌルは一時作成→移動→自動削除。</br>
配置は現在選択中のレイヤーに適用。分離次元や3D座標は既存Zを維持。</br>
</br>
