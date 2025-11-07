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
