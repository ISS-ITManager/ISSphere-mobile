import React, { forwardRef } from "react";
import {
  IonLabel,
  IonList,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonText,
} from "@ionic/react";
import { folderOpenOutline, trashOutline } from "ionicons/icons";
import DeletePopup from "../../utilities/DeletePopup";

interface Asset {
  id: number;
  serialNumber: string;
  action: string;
  description: string;
}

interface AssetListProps {
  assets: Asset[];
  workOrder: any;
  handleDelete: (id: number) => void;
}

const AssetList = forwardRef<any, AssetListProps>(
  ({ assets, workOrder, handleDelete }, ref) => {
    return (
      <div className="assets-section">
        <div className="assets-header">
          <IonLabel>Asset List</IonLabel>
          <p>List of assets used in this work order.</p>
        </div>
        {assets.length > 0 ? (
          <IonList className="assets-list">
            {assets.map((asset, index) => (
              <IonItem key={index} className="asset-item">
                <IonGrid>
                  <IonRow className="align-items-center">
                    <IonCol size="2">
                      <div className="serial-number">
                        <IonIcon
                          icon={folderOpenOutline}
                          className="cube-icon"
                        />
                        <IonText>{asset.serialNumber}</IonText>
                      </div>
                    </IonCol>
                    <IonCol size="4">
                      <IonText className="new-status">{asset.action}</IonText>
                    </IonCol>
                    <IonCol size="5">
                      <IonText>{asset.description}</IonText>
                    </IonCol>
                    <IonCol size="1" className="text-right">
                      {workOrder?.active_status?.status !== "closed" && (
                        <IonIcon
                          icon={trashOutline}
                          className="delete-icon"
                          onClick={() => handleDelete(asset.id)}
                          style={{ cursor: "pointer", color: "red" }}
                        />
                      )}
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
            ))}
          </IonList>
        ) : (
          <p>No assets found</p>
        )}
        <DeletePopup ref={ref} />
      </div>
    );
  }
);

export default AssetList;
