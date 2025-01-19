import React from "react";
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonText,
  IonSpinner,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { filterOutline, saveOutline } from "ionicons/icons";

interface AssetsProps {
  selectedAction: string | undefined;
  selectedCategory: string | undefined;
  selectedAsset: string | undefined;
  setSelectedAction: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSelectedAsset: React.Dispatch<React.SetStateAction<string | undefined>>;
  loadingCategories: boolean;
  loadingAssets: boolean;
  categoryOptions: any[];
  assetOptions: any[];
  onApplyFilter: () => void;
  apiSuccess: boolean;
  apiData: any[];
}

const Assets: React.FC<AssetsProps> = ({
  selectedAction,
  selectedCategory,
  selectedAsset,
  setSelectedAction,
  setSelectedCategory,
  setSelectedAsset,
  loadingCategories,
  loadingAssets,
  categoryOptions,
  assetOptions,
  onApplyFilter,
  apiSuccess,
  apiData,
}) => {
  return (
    <div>
      <IonItem>
        <IonLabel>Actions</IonLabel>
        <IonSelect
          value={selectedAction}
          onIonChange={(e) => setSelectedAction(e.detail.value)}
          placeholder="Select Action"
          slot="end"
        >
          {["new", "transfer", "repair", "condemn", "remove"].map(
            (action, index) => (
              <IonSelectOption key={index} value={action}>
                {action}
              </IonSelectOption>
            )
          )}
        </IonSelect>
      </IonItem>

      <IonItem>
        <IonLabel>Category</IonLabel>
        <IonSelect
          value={selectedCategory}
          onIonChange={(e) => setSelectedCategory(e.detail.value)}
          placeholder="Select Category"
          slot="end"
        >
          {loadingCategories ? (
            <IonSelectOption value="" disabled>
              <IonSpinner />
            </IonSelectOption>
          ) : (
            categoryOptions.map((category) => (
              <IonSelectOption key={category.id} value={category.id}>
                {category.asset_category}
              </IonSelectOption>
            ))
          )}
        </IonSelect>
      </IonItem>

      <IonItem>
        <IonLabel>Asset</IonLabel>
        <IonSelect
          value={selectedAsset}
          onIonChange={(e) => setSelectedAsset(e.detail.value)}
          placeholder="Select Asset"
          disabled={!selectedCategory}
          slot="end"
        >
          {loadingAssets ? (
            <IonSelectOption value="" disabled>
              <IonSpinner />
            </IonSelectOption>
          ) : (
            assetOptions.map((asset) => (
              <IonSelectOption key={asset.id} value={asset.id}>
                {asset.asset}
              </IonSelectOption>
            ))
          )}
        </IonSelect>
      </IonItem>

      <IonButton
        color={selectedAction ? "primary" : "secondary"}
        expand="block"
        style={{ borderRadius: "1px" }}
        onClick={onApplyFilter}
        disabled={!selectedAction || !selectedCategory || !selectedAsset}
      >
        <IonIcon slot="start" icon={filterOutline}></IonIcon>
        Apply Filters
      </IonButton>

      {apiSuccess && selectedAction === "new" && (
        <>
          <IonText>
            <h3>NEW ASSET</h3>
          </IonText>
          <IonItem>
            <IonLabel>Select New Asset</IonLabel>
            <IonSelect placeholder="Select New Asset" slot="end">
              {apiData.length > 0 ? (
                apiData.map((item) => (
                  <IonSelectOption key={item.id} value={item.id}>
                    {item.asset} - {item.serial_number}
                  </IonSelectOption>
                ))
              ) : (
                <IonSelectOption value="" disabled>
                  No assets available
                </IonSelectOption>
              )}
            </IonSelect>
          </IonItem>
        </>
      )}

      {selectedAction === "transfer" && (
        <>
          <IonText>
            <h3>TRANSFER ASSET</h3>
          </IonText>
          {[
            "Stock",
            "Group",
            "Entity",
            "Property",
            "Zone",
            "Level",
            "Room",
          ].map((label) => (
            <IonItem key={label}>
              <IonLabel>Select {label}</IonLabel>
              <IonSelect placeholder={`Select ${label}`} slot="end">
                <IonSelectOption value="">Option 1</IonSelectOption>
                <IonSelectOption value="">Option 2</IonSelectOption>
              </IonSelect>
            </IonItem>
          ))}
          <IonButton expand="block">
            <IonIcon slot="start" icon={saveOutline}></IonIcon>
            Save
          </IonButton>
        </>
      )}
    </div>
  );
};

export default Assets;
