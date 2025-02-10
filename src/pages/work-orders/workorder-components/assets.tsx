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
  IonInput,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonListHeader,
} from "@ionic/react";
import {
  filterOutline,
  saveOutline,
  trashOutlineaddOutline,
  addOutline,
  trashOutline,
  addCircleOutline,
} from "ionicons/icons";
import { storeWorkOrderAssets, fetchSupplies } from "../../../api/api";
import ErrorPopup from "../../../utilities/ErrorPopup";
import SuccessPopup from "../../../utilities/SuccessPopup";
import "../workorder.css";

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
  const [selectedSupplies, setSelectedSupplies] = useState<
    { id: number; supply: string; quantity: number; batch_number: string }[]
  >([]);
  const [selectedSupply, setSelectedSupply] = useState<string | null>(null);
  const [supplyQuantity, setSupplyQuantity] = useState<number>(1);
  const [supplies, setSupplies] = useState<any[]>([]);

  const errorPopupRef = useRef<{ showError: (msg: string) => void } | null>(
    null
  );
  const successPopupRef = useRef<{ showSuccess: (msg: string) => void } | null>(
    null
  );

  useEffect(() => {
    const getSupplies = async () => {
      try {
        const suppliesData = await fetchSupplies();
        setSupplies(suppliesData); // Store supplies data
      } catch (error) {
        console.error("Failed to fetch supplies", error);
      }
    };

    getSupplies(); // Call the function when the component mounts
  }, []);

  const handleAssets = async () => {
    if (!selectedAction || selectedAssetId === null) {
      console.error("Missing selected action or asset.");
      errorPopupRef.current?.showError(
        "Please select an action and an asset before saving."
      );
      return;
    }

    // Validation for Transfer
    if (
      selectedAction === "transfer" &&
      !selectedGroup &&
      !selectedEntity &&
      !selectedProperty &&
      !selectedZone &&
      !selectedLevel &&
      !selectedRoom
    ) {
      console.error("Missing selected location for transfer.");
      errorPopupRef.current?.showError(
        "Please select a valid location before transferring the asset."
      );
      return;
    }

    // Validation for Repair
    if (selectedAction === "repair") {
      if (selectedSupplies.length === 0) {
        console.error("No supplies selected for repair.");
        errorPopupRef.current?.showError("Please add at least one supply.");
        return;
      }
    }

    // Construct Payload
    const payload: any = {
      work_order: workOrderId,
      action: selectedAction,
      asset_stocks: [selectedAssetId],
    };

    // If action is "repair", add selected supplies to the payload
    if (selectedAction === "repair") {
      payload.asset_stock_supplies = selectedSupplies.reduce((acc, supply) => {
        if (!acc[selectedAssetId]) {
          acc[selectedAssetId] = {};
        }
        acc[selectedAssetId][supply.id] = supply.quantity;
        return acc;
      }, {});
    }

    // If action is "transfer", add location details
    if (selectedAction === "transfer") {
      if (selectedRoom) {
        payload.room = selectedRoom;
      } else if (selectedLevel) {
        payload.level = selectedLevel;
      } else if (selectedZone) {
        payload.zone = selectedZone;
      } else if (selectedProperty) {
        payload.property = selectedProperty;
      } else if (selectedEntity) {
        payload.entity = selectedEntity;
      } else if (selectedGroup) {
        payload.group = selectedGroup;
      }
    }

    // If action is "condemn" or "remove", just send the action and asset_stocks (no additional fields needed)
    if (selectedAction === "condemn" || selectedAction === "remove") {
      payload.action = selectedAction;
    }

    console.log("Payload: ", payload);

    try {
      const response = await storeWorkOrderAssets(payload);

      if (response?.success) {
        console.log("Save successful: ", response);
        successPopupRef.current?.showSuccess(
          response?.message || "Operation completed successfully!"
        );
        onSuccess();

        // Reset Fields
        setSelectedAction("");
        setSelectedAssetId(null);
        setSelectedSupplies([]);
        setSelectedSupply(null);
        setSupplyQuantity(1);
        setSelectedGroup(null);
        setSelectedEntity(null);
        setSelectedProperty(null);
        setSelectedZone(null);
        setSelectedLevel(null);
        setSelectedRoom(null);
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

  // Handle adding supply to the list
  const handleAddSupply = () => {
    if (!selectedAssetId) {
      errorPopupRef.current?.showError("Please select an asset.");
      return;
    }

    if (!selectedSupply) {
      errorPopupRef.current?.showError("Please select a supply.");
      return;
    }

    if (supplyQuantity <= 0) {
      errorPopupRef.current?.showError("Quantity must be at least 1.");
      return;
    }

    // Prevent duplicate supply entries
    const isDuplicate = selectedSupplies.some(
      (s) => s.id === selectedSupply.id
    );
    if (isDuplicate) {
      errorPopupRef.current?.showError(
        "This supply is already added. Please update the quantity if needed."
      );
      return;
    }

    setSelectedSupplies((prevSupplies) => [
      ...prevSupplies,
      {
        id: selectedSupply.id,
        supply: selectedSupply.supply,
        batch_number: selectedSupply.batch_number,
        quantity: supplyQuantity,
      },
    ]);

    // Reset selection
    setSelectedSupply(null);
    setSupplyQuantity(1);
  };

  // Handle removing supply from the list
  const handleRemoveSupply = (index: number) => {
    setSelectedSupplies((prevSupplies) =>
      prevSupplies.filter((_, i) => i !== index)
    );
  };

  const customActionSheetOptions = {
    header: "Actions",
    subHeader: "Select Action",
  };
  const customActionSheetOptionsCategory = {
    header: "Category",
    subHeader: "Select Category",
  };
  const customActionSheetOptionsAssets = {
    header: "Assets",
    subHeader: "Select Asset",
  };
  const customActionSheetOptionsNewAsset = {
    header: "New Asset",
    subHeader: "Select New Asset",
  };
  const customActionSheetOptionsGroup = {
    header: "Group List",
    subHeader: "Select Group",
  };
  const customActionSheetOptionsEntity = {
    header: "Entity List",
    subHeader: "Select Entity",
  };
  const customActionSheetOptionsProperty = {
    header: "Property List",
    subHeader: "Select Property",
  };
  const customActionSheetOptionsZone = {
    header: "Zone List",
    subHeader: "Select Zone",
  };
  const customActionSheetOptionsLevel = {
    header: "Level List",
    subHeader: "Select Level",
  };
  const customActionSheetOptionsRoom = {
    header: "Rooms List",
    subHeader: "Select Room",
  };
  const customActionSheetOptionsSupply = {
    header: "Supply List",
    subHeader: "Select Supplies",
  };

  return (
    <div>
      <ErrorPopup ref={errorPopupRef} />
      <SuccessPopup ref={successPopupRef} />
      <div className="filter-card">
        <div className="filter-header">
          <IonText>
            <h3>FILTER OPTION</h3>
          </IonText>
        </div>

        <div className="filter-content">
          {/* Actions Select */}
          <IonItem>
            <IonSelect
              value={selectedAction}
              onIonChange={(e) => setSelectedAction(e.detail.value)}
              placeholder="Select Action"
              className="full-width"
              label="Actions"
              interfaceOptions={customActionSheetOptions}
              interface="action-sheet"
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

          {/* Category Select */}
          <IonItem className="custom-item">
            <IonSelect
              value={selectedCategory}
              onIonChange={(e) => setSelectedCategory(e.detail.value)}
              placeholder="Select Category"
              className="full-width"
              label="Assets Category"
              interfaceOptions={customActionSheetOptionsCategory}
              interface="action-sheet"
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

          {/* Asset Select */}
          <IonItem className="custom-item">
            <IonSelect
              value={selectedAsset}
              onIonChange={(e) => setSelectedAsset(e.detail.value)}
              placeholder="Select Asset"
              disabled={!selectedCategory}
              className="full-width"
              label="Asset"
              interfaceOptions={customActionSheetOptionsAssets}
              interface="action-sheet"
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

          {/* Apply Filter Button */}
          <IonButton
            color={selectedAction ? "primary" : "secondary"}
            expand="block"
            className="apply-btn"
            onClick={onApplyFilter}
            disabled={!selectedAction || !selectedCategory || !selectedAsset}
          >
            <IonIcon slot="start" icon={filterOutline}></IonIcon>
            Apply Filters
          </IonButton>
        </div>
      </div>

      {apiSuccess && selectedAction === "new" && (
        <>
          <IonText>
            <h3>NEW ASSET</h3>
          </IonText>
          <IonItem>
            <IonSelect
              placeholder="Select New Asset"
              className="full-width"
              label="Select New Asset"
              interfaceOptions={customActionSheetOptionsNewAsset}
              interface="action-sheet"
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
            <IonSelect
              placeholder="Select Asset"
              onIonChange={(e) => setSelectedAssetId(e.detail.value)} // Store the selected asset ID
              className="full-width"
              label="Select Asset"
              interfaceOptions={customActionSheetOptionsAssets}
              interface="action-sheet"
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
            <IonSelect
              placeholder="Select Group"
              className="full-width"
              label="Select Group"
              interfaceOptions={customActionSheetOptionsGroup}
              interface="action-sheet"
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
              <IonSelect
                placeholder="Select Entity"
                className="full-width"
                label="Select Entity"
                interfaceOptions={customActionSheetOptionsEntity}
                interface="action-sheet"
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
              <IonSelect
                placeholder="Select Property"
                className="full-width"
                label="Select Property"
                interfaceOptions={customActionSheetOptionsProperty}
                interface="action-sheet"
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
              <IonSelect
                placeholder="Select Zone"
                className="full-width"
                label="Select Zone"
                interfaceOptions={customActionSheetOptionsZone}
                interface="action-sheet"
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
              <IonSelect
                placeholder="Select Level"
                className="full-width"
                label="Select Level"
                interfaceOptions={customActionSheetOptionsLevel}
                interface="action-sheet"
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
              <IonSelect
                placeholder="Select Room"
                className="full-width"
                label="Select Room"
                interfaceOptions={customActionSheetOptionsRoom}
                interface="action-sheet"
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
            <IonSelect
              placeholder="Select Asset"
              className="full-width"
              label="Select Asset"
              interfaceOptions={customActionSheetOptionsAssets}
              interface="action-sheet"
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

          <IonItem>
            <IonSelect
              placeholder="Select Supply"
              className="full-width"
              label="Select Supply"
              interfaceOptions={customActionSheetOptionsSupply}
              interface="action-sheet"
              value={selectedSupply}
              onIonChange={(e) => setSelectedSupply(e.detail.value)}
            >
              {supplies.length > 0 ? (
                supplies.map((item) => (
                  <IonSelectOption key={item.id} value={item}>
                    {item.supplier}, {item.supply} - {item.batch_number}{" "}
                    (Balance: {item.balance}) {item.cost} QR
                  </IonSelectOption>
                ))
              ) : (
                <IonSelectOption value="" disabled>
                  No supplies available
                </IonSelectOption>
              )}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel>Quantity</IonLabel>
            <IonInput
              type="number"
              value={supplyQuantity}
              min="1"
              onIonChange={(e) => setSupplyQuantity(Number(e.detail.value))}
            />
          </IonItem>

          <IonButton
            expand="block"
            color="primary"
            onClick={handleAddSupply}
            disabled={
              !selectedAssetId || !selectedSupply || supplyQuantity <= 0
            }
          >
            Add Supply
          </IonButton>

          {/* List of Added Supplies */}
          <IonText>
            <h3>SUPPLY ADDED</h3>
          </IonText>
          <IonList>
            {selectedSupplies.map((supply, index) => (
              <IonItem key={index}>
                <IonLabel>
                  {supply.quantity}x {supply.supply} (Batch:{" "}
                  {supply.batch_number})
                </IonLabel>
                <IonButton
                  fill="clear"
                  color="danger"
                  onClick={() => handleRemoveSupply(index)}
                >
                  <IonIcon icon={trashOutline} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>

          <IonButton expand="block" color="primary" onClick={handleAssets}>
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
            <IonSelect
              placeholder="Select Asset"
              className="full-width"
              label="Select Asset"
              interfaceOptions={customActionSheetOptionsNewAsset}
              interface="action-sheet"
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

      {apiSuccess && selectedAction === "remove" && (
        <>
          <IonText>
            <h3>REMOVE ASSET</h3>
          </IonText>
          <IonItem>
            <IonSelect
              placeholder="Select Asset"
              className="full-width"
              label="Select Asset"
              interfaceOptions={customActionSheetOptionsNewAsset}
              interface="action-sheet"
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
    </div>
  );
};

export default Assets;
