<img width="206" height="164" alt="copipe" src="https://github.com/user-attachments/assets/cd40701b-c91c-49c4-9000-117024de2f64" /></br>
</br>
■CoPiPe.jsx v1.1d 説明■</br>
選択中のコンポまたはレイヤーを依存関係ごとAEPXに一時保存して</br>
別のAEプロジェクトへ貼り付ける。</br>
</br>
■起動■</br>
ファイル＞スクリプト＞スクリプトファイルを実行 から</br>
CoPiPe.jsx を起動</br>
</br>
■仕組み■</br>
Copy</br>
対象を起点に依存アイテムを調べ、「必要なもの以外」を一時的に削除。</br>
Desktop/CoPiPe.aepx として保存（AEPX=XML形式）。</br>
直前の状態へUndoで復帰。</br>
</br>
Past</br>
CoPiPe.aepx をプロジェクトにインポート。</br>
Layerモードは、AEPX内の CoPiPe コンポから順序を保持して貼り付け。</br>
「Dell CoPiPe.aepx」チェックONなら取り込み後にAEPXを削除。</br>
</br>
■UI■</br>
Mode: Comp / Layer を選択。</br>
Dell CoPiPe.aepx: チェックONでペースト後にAEPX削除。OFFなら残す。</br>
Copy / Past: 上記動作を実行。</br>
</br>
■注意点■</br>
外部フッテージはパスが変わると再リンクが必要。</br>
名前依存のエクスプレッションは、貼り付け先で名前が変わると手直しが必要な場合がある。</br>
AEPXが読み取り専用や権限で消せない場合、削除はスキップされる。</br>
</br>
■更新履歴■</br>
1.1d	プロジェクトウインドウ内にある、WAV単体のコピペにも対応</br>
1.1c	コピー元のAE名がCoPiPe.aepxになるのを元のファイル名のままになるよう対応</br>
