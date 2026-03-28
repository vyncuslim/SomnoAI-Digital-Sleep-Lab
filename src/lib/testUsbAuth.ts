// src/lib/testUsbAuth.ts
export interface UsbDeviceInfo {
  serialNumber: string | null;
  vendorId: number;
  productId: number;
  productName?: string;
  manufacturerName?: string;
}

export async function testUdiskAccess(): Promise<{
  success: boolean;
  message: string;
  deviceInfo?: UsbDeviceInfo;
}> {
  console.log("=== U-disk WebUSB Diagnostic Start ===");

  if (!('usb' in navigator)) {
    return { success: false, message: "Browser does not support WebUSB. Please use latest Chrome/Edge." };
  }

  try {
    // Loose filters to see everything the browser allows
    const device = await (navigator as any).usb.requestDevice({
      filters: [] 
    });

    console.log("Selected USB Device Info:", {
      productName: device.productName,
      manufacturerName: device.manufacturerName,
      serialNumber: device.serialNumber,
      vendorId: '0x' + device.vendorId.toString(16).padStart(4, '0'),
      productId: '0x' + device.productId.toString(16).padStart(4, '0'),
    });

    await device.open();
    console.log("Device opened successfully.");

    await device.selectConfiguration(1);
    const interfaces = device.configuration?.interfaces || [];
    console.log("Available Interfaces:", interfaces);

    let claimed = false;
    for (const iface of interfaces) {
      try {
        await device.claimInterface(iface.interfaceNumber);
        claimed = true;
        console.log(`Successfully claimed interface ${iface.interfaceNumber}`);
        break; // Stop after first successful claim
      } catch (claimErr) {
        console.warn(`Failed to claim interface ${iface.interfaceNumber}:`, claimErr);
      }
    }

    if (!claimed) {
      console.log("Could not claim any interfaces (likely Mass Storage protection). Closing device, but we still have descriptors.");
      await device.close();
    }

    const deviceInfo: UsbDeviceInfo = {
      serialNumber: device.serialNumber,
      vendorId: device.vendorId,
      productId: device.productId,
      productName: device.productName,
      manufacturerName: device.manufacturerName,
    };

    return {
      success: true,
      message: claimed ? "Device accessed and interface claimed!" : "Device descriptor read successfully, but interface is protected (Mass Storage).",
      deviceInfo
    };

  } catch (err: any) {
    console.error("WebUSB Diagnostic Error:", err);
    let msg = "U-disk access failed";

    if (err.name === 'NotFoundError' || err.message.includes('No device selected')) {
      msg = "Browser did not detect your U-disk in the popup. It may be locked by the OS.";
    } else if (err.message.includes('protected') || err.message.includes('claimInterface') || err.message.includes('Mass Storage')) {
      msg = "Standard U-disks are protected by the browser. Cannot fully access.";
    } else {
      msg = err.message || "Unknown USB error.";
    }

    return { success: false, message: msg };
  }
}
