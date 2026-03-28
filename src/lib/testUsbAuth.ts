// src/lib/testUsbAuth.ts
export async function testUdiskAccess() {
  console.log("=== U-disk WebUSB Deep Diagnostic Start ===");

  if (!('usb' in navigator)) {
    console.error("WebUSB not supported in this browser.");
    return { success: false, message: "Browser does not support WebUSB" };
  }

  try {
    // Loose filters to see everything the browser allows
    const device = await (navigator as any).usb.requestDevice({
      filters: [] 
    });

    const info = {
      productName: device.productName,
      manufacturerName: device.manufacturerName,
      serialNumber: device.serialNumber,
      vendorId: device.vendorId.toString(16).padStart(4, '0'),
      productId: device.productId.toString(16).padStart(4, '0'),
      deviceClass: device.deviceClass,
      deviceSubclass: device.deviceSubclass,
    };

    console.log("Selected Device Descriptor:", info);

    await device.open();
    console.log("Device opened successfully.");

    // Attempt to select configuration
    await device.selectConfiguration(1);
    const interfaces = device.configuration?.interfaces || [];
    console.log("Available Interfaces:", interfaces);

    const results: any[] = [];

    // Attempt to claim each interface (This is where Mass Storage usually fails)
    for (const iface of interfaces) {
      try {
        await device.claimInterface(iface.interfaceNumber);
        console.log(`Successfully claimed interface ${iface.interfaceNumber}`);
        results.push({ id: iface.interfaceNumber, status: "claimed" });
      } catch (claimErr: any) {
        console.warn(`Failed to claim interface ${iface.interfaceNumber}:`, claimErr.message);
        results.push({ id: iface.interfaceNumber, status: "failed", error: claimErr.message });
      }
    }

    const isMassStorage = interfaces.some((i: any) => 
      i.alternates.some((a: any) => a.interfaceClass === 8)
    );

    return {
      success: true,
      message: isMassStorage ? "Mass Storage detected. Full access is restricted by browser security policies." : "Device accessed successfully.",
      deviceInfo: info,
      interfaceResults: results
    };

  } catch (err: any) {
    console.error("WebUSB Diagnostic Error:", err);
    let msg = err.message || "Unknown error";

    if (msg.includes("protected") || msg.includes("Mass Storage") || msg.includes("claim")) {
      msg = "Detected Mass Storage Protection: Standard U-disks are blocked by browser security to protect your files. WebUSB cannot claim this interface.";
    } else if (msg.includes("No device selected") || msg.includes("NotFoundError")) {
      msg = "Device not shown: Your U-disk might be locked by the OS. Try 'Ejecting' it first (without unplugging).";
    }

    return { success: false, message: msg };
  }
}
