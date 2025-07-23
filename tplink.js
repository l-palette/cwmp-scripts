if (is_tplink){
    declare("InternetGatewayDevice.LANDevice.*.WLANConfiguration.*.*", {path: now});
    declare("InternetGatewayDevice.LANDevice.*.WLANConfiguration.1.SSID", {value: now}, {value: vendor + '_' + serial_number.substring(9)});  
    declare("InternetGatewayDevice.LANDevice.*.WLANConfiguration.2.SSID", {value: now}, {value: vendor + '_' + serial_number.substring(9) + "_5G"});
    declare("InternetGatewayDevice.LANDevice.*.WLANConfiguration.*.X_TP_PreSharedKey", null, {value: serial_number});  
    declare("InternetGatewayDevice.LANDevice.1.WLANConfiguration.*.Enable", {value: now}, {value: true});
    
    commit();
  
    // укажем путь для конфигурации DHCP и PPPoE
    let base_path_dhcp = "InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1";
    // второй интерфейс - 5G
    let base_path_pppoe = "InternetGatewayDevice.WANDevice.1.WANConnectionDevice.3";
  
    // конфигурация DHCP
    let values_dhcp = {
        X_TP_IfName: "eth0.3970_0",
        Name: "ipoe_eth_3970_0_d",
        AddressingType: "DHCP",
        ConnectionType: "IP_Routed",
        ConnectionTrigger: "AlwaysOn",
        Enable: true,
    };
  
    const path_dhcp = base_path_dhcp + '.WANIPConnection.[' + Object.keys(values_dhcp).map(key => key + ':' + values_dhcp[key]).join(',') + ']';
    //InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANIPConnection.[X_TP_IfName:eth0.3970_0,Name:ipoe_eth_3970_0_d,AddressingType:DHCP,ConnectionType:IP_Routed,ConnectionTrigger:AlwaysOn,Enable:true]
    declare(path_dhcp, {path: 1, writtable: 1}, {path: 1});
    commit();
    log("dhcp configuration");
    // конфигурация влана на первом интерфейсе
    let values_dhcp_vlan = {
        Enable: true,
        X_TP_IfName: "eth0.3970",
        X_TP_VID: 3970,
        X_TP_VLanEnabled: true,
        EthernetLinkStatus: "Up",
    };
    
    const path_dhcp_vlan = base_path_dhcp + '.WANEthernetLinkConfig.[' + Object.keys(values_dhcp_vlan).map(key => key + ':' + values_dhcp_vlan[key]).join(',') + ']';
    //InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANEthernetLinkConfig.[Enable:true,X_TP_IfName:eth0.3970,X_TP_VID:3970,X_TP_VLanEnabled:true,EthernetLinkStatus:Up]
    declare(path_dhcp_vlan, {path: 1, writtable: 1});
    commit();
    log("dhcp vlan configuration");
    // конфигурация PPPoE
    let values_pppoe = {
      X_TP_IfName: "ppp0",
      X_TP_L2IfName: "eth0.2_1",
      Name: "pppoe_eth_0_1_d",
      ConnectionType: "IP_Routed",
      ConnectionTrigger: "AlwaysOn",
      TransportType: "PPPoE",
      NATEnabled: true,
      X_TP_FirewallEnabled: true,
      Enable: true,
    };
  
    declare("InternetGatewayDevice.WANDevice.1.WANConnectionDevice.[]", null, {path: 2, writable: 1});
    commit();
    log("second instance");
    /*
    for (const key in values_pppoe) {
     const path1 = InternetGatewayDevice.WANDevice.1.WANConnectionDevice.2.WANPPPConnection.1.${key};
     declare(path1, {value: now}, {value: values_pppoe[key]});
 }
    */
    declare("InternetGatewayDevice.WANDevice.1.WANConnectionDevice.2.WANPPPConnection.*.*", {path: now});
    commit();
    log("update pppoe");
    const path_pppoe = base_path_pppoe + '.WANPPPConnection.[' + Object.keys(values_pppoe).map(key => key + ':' + values_pppoe[key]).join(',') + ']';
    //InternetGatewayDevice.WANDevice.1.WANConnectionDevice.2.WANPPPConnection.[X_TP_IfName:ppp0,X_TP_L2IfName:eth0.2_1,Name:pppoe_eth_0_1_d,ConnectionType:IP_Routed,ConnectionTrigger:AlwaysOn,TransportType:PPPoE,NATEnabled:true,X_TP_FirewallEnabled:true,Enable:true]
    declare(path_pppoe, {path: 1, writtable: 1}, {path: 1});
    log("pppoe configuration");
    // конфигурация влана на третьем интерфейсе
    let values_pppoe_vlan = {
        Enable: true,
        X_TP_VID: false,
        X_TP_VLanEnabled: false,
        X_TP_IfName: "eth0.2",
        EthernetLinkStatus: "Up",
    };
  
    const path_pppoe_vlan = base_path_pppoe + '.WANEthernetLinkConfig.[' + Object.keys(values_pppoe_vlan).map(key => key + ':' + values_pppoe_vlan[key]).join(',') + ']';
