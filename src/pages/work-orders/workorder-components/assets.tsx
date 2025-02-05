import React, { useState, useRef, useEffect } from "react";
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
import { storeWorkOrderAssets } from "../../../api/api";
import ErrorPopup from "../../../utilities/ErrorPopup";
import SuccessPopup from "../../../utilities/SuccessPopup";

interface AssetsProps {
  workOrderId: string;
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
  groups: any[];
  setSelectedGroup: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedGroup: string | undefined;
  entities: any[];
  // selectedEntities: React.Dispatch<React.SetStateAction<any[]>>;
  selectedEntity: string | undefined;
  setSelectedEntity: React.Dispatch<React.SetStateAction<string | undefined>>;
  properties: any[];
  selectedProperty: string | undefined;
  setSelectedProperty: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedZone: string | undefined;
  setSelectedZone: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedLevel: string | undefined;
  setSelectedLevel: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedRoom: string | undefined;
  setSelectedRoom: React.Dispatch<React.SetStateAction<string | undefined>>;
  zones: any[];
  levels: any[];
  rooms: any[];
  onApplyFilter: () => void;
  apiSuccess: boolean;
  apiData: any[];
  onSuccess: () => void;
}

const Assets: React.FC<AssetsProps> = ({
  workOrderId,
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
  groups,
  selectedGroup,
  setSelectedGroup,
  entities,
  selectedEntity,
  setSelectedEntity,
  properties,
  selectedProperty,
  setSelectedProperty,
  zones,
  selectedZone,
  setSelectedZone,
  levels,
  selectedLevel,
  setSelectedLevel,
  rooms,
  selectedRoom,
  setSelectedRoom,
  onApplyFilter,
  apiSuccess,
  apiData,
  onSuccess,
}) => {
  console.log("Entities: " + JSON.stringify(entities, null, 2));
  console.log("Workorderss: " + JSON.stringify(workOrderId, null, 2));
  console.log("Assets: " + JSON.stringify(apiData, null, 2));

  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);

  const errorPopupRef = useRef<{ showError: (msg: string) => void } | null>(
    null
  );
  const successPopupRef = useRef<{ showSuccess: (msg: string) => void } | null>(
    null
  );

  const handleAssets = async () => {
    if (!selectedAction || selectedAssetId === null) {
      console.error("Missing selected action or asset.");
      errorPopupRef.current?.showError(
        "Please select an action and an asset before saving."
      );
      return;
    }

    if (selectedAction === "transfer" && selectedRoom === null) {
      console.error("Missing selected room for transfer.");
      errorPopupRef.current?.showError(
        "Please select a room before transferring the asset."
      );
      return;
    }

    const payload: any = {
      work_order: workOrderId,
      action: selectedAction,
      asset_stocks: [selectedAssetId],
    };

    if (selectedAction === "transfer") {
      payload.room = selectedRoom;
    }

    console.log("Payload: ", payload);

    try {
      const response = await storeWorkOrderAssets(payload);

      if (response?.success) {
        console.log("Save successful: ", response);
        successPopupRef.current?.showSuccess(
          response?.message || "Asset has been added successfully!"
        );
        onSuccess();
      } else {
        console.error(
          "Error saving: ",
          response?.message || "Unknown error occurred."
        );
        errorPopupRef.current?.showError(
          response?.message || "Something went wrong."
        );
      }
    } catch (error: any) {
      console.error("An error occurred:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";
      errorPopupRef.current?.showError(errorMessage);
    }
  };

  return (
    <div>
      <ErrorPopup ref={errorPopupRef} />
      <SuccessPopup ref={successPopupRef} />
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
            <IonSelect
              placeholder="Select New Asset"
              slot="end"
              onIonChange={(e) => setSelectedAssetId(e.detail.value)} // Store the selected asset ID
            >
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

          <IonButton expand="block" color="primary" onClick={handleAssets}>
            <IonIcon slot="start" icon={saveOutline}></IonIcon>
            Save
          </IonButton>
        </>
      )}

      {apiSuccess && selectedAction === "transfer" && (
        <>
          <IonText>
            <h3>TRANSFER ASSET</h3>
          </IonText>

          <IonItem>
            <IonLabel>Select Asset</IonLabel>
            <IonSelect
              placeholder="Select New Asset"
              slot="end"
              onIonChange={(e) => setSelectedAssetId(e.detail.value)} // Store the selected asset ID
            >
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

          {/* Group Selection */}
          <IonItem>
            <IonLabel>Select Group</IonLabel>
            <IonSelect
              placeholder="Select Group"
              slot="end"
              onIonChange={(e) => {
                setSelectedGroup(e.detail.value);
                setSelectedEntity(null); // Reset dependent dropdowns
                setSelectedProperty(null);
                setSelectedZone(null);
                setSelectedLevel(null);
                setSelectedRoom(null);
              }}
            >
              {groups.map((group) => (
                <IonSelectOption key={group.id} value={group.id}>
                  {group.group} - {group.country} ({group.country_code})
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          {/* Entity Selection */}
          {selectedGroup && (
            <IonItem>
              <IonLabel>Select Entity</IonLabel>
              <IonSelect
                placeholder="Select Entity"
                slot="end"
                onIonChange={(e) => {
                  setSelectedEntity(e.detail.value);
                  setSelectedProperty(null);
                  setSelectedZone(null);
                  setSelectedLevel(null);
                  setSelectedRoom(null);
                }}
              >
                {entities.length > 0 ? (
                  entities.map((entity) => (
                    <IonSelectOption key={entity.id} value={entity.id}>
                      {entity.entity}
                    </IonSelectOption>
                  ))
                ) : (
                  <IonSelectOption value="" disabled>
                    No entities available
                  </IonSelectOption>
                )}
              </IonSelect>
            </IonItem>
          )}

          {/* Property Selection */}
          {selectedEntity && (
            <IonItem>
              <IonLabel>Select Property</IonLabel>
              <IonSelect
                placeholder="Select Property"
                slot="end"
                onIonChange={(e) => {
                  setSelectedProperty(e.detail.value);
                  setSelectedZone(null);
                  setSelectedLevel(null);
                  setSelectedRoom(null);
                }}
              >
                {properties.length > 0 ? (
                  properties.map((property) => (
                    <IonSelectOption key={property.id} value={property.id}>
                      {property.property}
                    </IonSelectOption>
                  ))
                ) : (
                  <IonSelectOption value="" disabled>
                    No properties available
                  </IonSelectOption>
                )}
              </IonSelect>
            </IonItem>
          )}

          {/* Zone Selection */}
          {selectedProperty && (
            <IonItem>
              <IonLabel>Select Zone</IonLabel>
              <IonSelect
                placeholder="Select Zone"
                slot="end"
                onIonChange={(e) => {
                  setSelectedZone(e.detail.value);
                  setSelectedLevel(null);
                  setSelectedRoom(null);
                }}
              >
                {zones.length > 0 ? (
                  zones.map((zone) => (
                    <IonSelectOption key={zone.id} value={zone.id}>
                      {zone.zone}
                    </IonSelectOption>
                  ))
                ) : (
                  <IonSelectOption value="" disabled>
                    No zones available
                  </IonSelectOption>
                )}
              </IonSelect>
            </IonItem>
          )}

          {/* Level Selection */}
          {selectedZone && (
            <IonItem>
              <IonLabel>Select Level</IonLabel>
              <IonSelect
                placeholder="Select Level"
                slot="end"
                onIonChange={(e) => {
                  setSelectedLevel(e.detail.value);
                  setSelectedRoom(null);
                }}
              >
                {levels.length > 0 ? (
                  levels.map((level) => (
                    <IonSelectOption key={level.id} value={level.id}>
                      {level.level}
                    </IonSelectOption>
                  ))
                ) : (
                  <IonSelectOption value="" disabled>
                    No levels available
                  </IonSelectOption>
                )}
              </IonSelect>
            </IonItem>
          )}

          {/* Room Selection */}
          {selectedLevel && (
            <IonItem>
              <IonLabel>Select Room</IonLabel>
              <IonSelect
                placeholder="Select Room"
                slot="end"
                onIonChange={(e) => setSelectedRoom(e.detail.value)} // Update selected room
              >
                {rooms.length > 0 ? (
                  rooms.map((room) => (
                    <IonSelectOption key={room.id} value={room.id}>
                      {room.room}
                    </IonSelectOption>
                  ))
                ) : (
                  <IonSelectOption value="" disabled>
                    No rooms available
                  </IonSelectOption>
                )}
              </IonSelect>
            </IonItem>
          )}

          <IonButton expand="block" color="primary" onClick={handleAssets}>
            <IonIcon slot="start" icon={saveOutline}></IonIcon>
            Save
          </IonButton>
        </>
      )}

      {apiSuccess && selectedAction === "repair" && (
        <>
          <IonText>
            <h3>REPAIR ASSET</h3>
          </IonText>
          <IonItem>
            <IonLabel>Select Asset Stock</IonLabel>
            <IonSelect placeholder="Select Asset Stock" slot="end">
              {/* Replace with dynamic data if available */}
              <IonSelectOption value="stock1">Stock 1</IonSelectOption>
              <IonSelectOption value="stock2">Stock 2</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel>Supplies</IonLabel>
            <IonSelect
              placeholder="Select Supplies"
              multiple
              onIonChange={(e) =>
                console.log("Selected Supplies:", e.detail.value)
              }
            >
              {/* Replace with dynamic supply options */}
              <IonSelectOption value="supply1">Supply 1</IonSelectOption>
              <IonSelectOption value="supply2">Supply 2</IonSelectOption>
              <IonSelectOption value="supply3">Supply 3</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonButton expand="block" color="primary">
            <IonIcon slot="start" icon={saveOutline}></IonIcon>
            Save
          </IonButton>
        </>
      )}

      {apiSuccess && selectedAction === "condemn" && (
        <>
          <IonText>
            <h3>CONDEMN ASSET</h3>
          </IonText>
          <IonItem>
            <IonLabel>Select Asset Stock</IonLabel>
            <IonSelect placeholder="Select Asset Stock" slot="end">
              {/* Replace with dynamic asset stock options */}
              <IonSelectOption value="stock1">Stock 1</IonSelectOption>
              <IonSelectOption value="stock2">Stock 2</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonButton expand="block" color="primary">
            <IonIcon slot="start" icon={saveOutline}></IonIcon>
            Save
          </IonButton>
        </>
      )}

      {apiSuccess && selectedAction === "remove" && (
        <>
          <IonText>
            <h3>REMOVE ASSET</h3>
          </IonText>
          <IonItem>
            <IonLabel>Select Asset Stock</IonLabel>
            <IonSelect placeholder="Select Asset Stock" slot="end">
              {/* Replace with dynamic asset stock options */}
              <IonSelectOption value="stock1">Stock 1</IonSelectOption>
              <IonSelectOption value="stock2">Stock 2</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonButton expand="block" color="primary">
            <IonIcon slot="start" icon={saveOutline}></IonIcon>
            Save
          </IonButton>
        </>
      )}
    </div>
  );
};

export default Assets;
