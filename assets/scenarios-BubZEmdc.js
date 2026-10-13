var e=[{title:{en:`WEB cannot reach APP`,hi:`WEB, APP tak nahi pahunchta`},ticket:{en:`New EPGs WEB and APP were created in VRF PROD of tenant NK-PROD. Pings inside WEB work, but WEB1 (10.1.1.11) cannot open TCP 80 on APP1 (10.1.2.21). Both servers can ping their own gateways.`,hi:`Tenant NK-PROD ke VRF PROD mein naye EPGs WEB aur APP banaye gaye. WEB ke andar pings chalte hain, lekin WEB1 (10.1.1.11) APP1 (10.1.2.21) par TCP 80 nahi khol pata. Dono servers apne gateways ping kar lete hain.`},out:`APIC1# show vrf
 Tenant           VRF              Enforcement    VNID
 ---------------- ---------------- -------------- ----------
 NK-PROD          PROD             enforced       2555904

APIC1# show epg
 Tenant           AP               EPG              Bridge Domain    pcTag  Provided / Consumed
 ---------------- ---------------- ---------------- ---------------- ------ -----------------------
 NK-PROD          ECOM             WEB              WEB-BD           32770  - / -
 NK-PROD          ECOM             APP              APP-BD           32771  - / -`,q:{en:`What is needed?`,hi:`Kya chahiye?`},o:[{en:`Move WEB and APP into different VRFs`,hi:`WEB aur APP ko alag VRFs mein daalo`},{en:`Enable OSPF between the two bridge domains`,hi:`Dono bridge domains ke beech OSPF enable karo`},{en:`A contract with a TCP 80 filter, provided by APP and consumed by WEB`,hi:`TCP 80 filter wala contract, APP provide kare aur WEB consume kare`},{en:`A static route on LEAF101 towards 10.1.2.0/24`,hi:`LEAF101 par 10.1.2.0/24 ki taraf static route`}],a:2,w:{en:`The VRF is enforced and neither EPG provides or consumes anything, so the implicit deny drops inter-EPG traffic. Routing already works (gateways reachable). Add the contract; leaf routing cannot be configured by hand in ACI anyway.`,hi:`VRF enforced hai aur koi EPG kuch provide ya consume nahi karta, isliye implicit deny inter-EPG traffic drop karta hai. Routing pehle se chal rahi hai (gateways reachable). Contract jodo; ACI mein leaf routing haath se configure bhi nahi hoti.`}},{title:{en:`A fault right after adding a static port`,hi:`Static port jodte hi fault`},ticket:{en:`The server team asked for VLAN 250 on leaf 103 eth1/10 for EPG DB. The binding shows as not deployed and the APIC shows this fault.`,hi:`Server team ne EPG DB ke liye leaf 103 eth1/10 par VLAN 250 maanga. Binding not deployed dikhti hai aur APIC yeh fault dikhata hai.`},out:`APIC1# show faults code F0467
 Code              : F0467
 Severity          : minor
 Lifecycle         : Raised
 DN                : uni/tn-NK-PROD/ap-ECOM/epg-DB/node-103/stpathatt-[eth1/10]/nwissues
 Cause             : configuration-failed
 Description       : Configuration failed for uni/tn-NK-PROD/ap-ECOM/epg-DB node 103 eth1/10 due to
                     Invalid VLAN Configuration, debug message: invalid-vlan: vlan-250 :: Either the EpG
                     is not associated with a domain or the domain does not have this vlan assigned to it

APIC1# moquery -c fvnsVlanInstP
# fvns.VlanInstP
name         : NK-POOL
dn           : uni/infra/vlanns-[NK-POOL]-static
allocMode    : static
blocks       : vlan-100-vlan-199`,q:{en:`Where is the fix?`,hi:`Fix kahan hai?`},o:[{en:`Create VLAN 250 on leaf 103 from its CLI`,hi:`Leaf 103 par uske CLI se VLAN 250 banao`},{en:`Add VLAN 250 (for example block 200-299) as a static encap block to NK-POOL, the pool of the EPG's domain`,hi:`EPG ke domain ke pool NK-POOL mein VLAN 250 (jaise block 200-299) static encap block ki tarah jodo`},{en:`Change the BD subnet of EPG DB`,hi:`EPG DB ka BD subnet badlo`},{en:`Add a contract to EPG DB`,hi:`EPG DB par contract jodo`}],a:1,w:{en:`invalid-vlan means the VLAN is outside the static blocks of the pool behind the EPG's domain. The pool only holds 100-199. Leaves are never configured by CLI in ACI.`,hi:`invalid-vlan matlab VLAN EPG ke domain ke peeche wale pool ke static blocks ke bahar hai. Pool mein sirf 100-199 hai. ACI mein leaves CLI se kabhi configure nahi hote.`}},{title:{en:`The leaf that never showed up`,hi:`Woh leaf jo kabhi dikha hi nahi`},ticket:{en:`Two new leaves were cabled to both spines. LEAF101 (cabled to the APIC) is active, but LEAF102 does not appear anywhere after 30 minutes.`,hi:`Do naye leaves dono spines se cable hue. LEAF101 (APIC se cabled) active hai, lekin 30 minute baad bhi LEAF102 kahin nahi dikhta.`},out:`Fabric > Inventory > Fabric Membership
  Registered Nodes:
    101  LEAF101   FDO23451A1B  leaf   active
  Nodes Pending Registration:
    Serial FGE38482XTN   Role spine   Status: Undiscovered

APIC1# acidiag fnvread
      ID   Pod ID       Name    Serial Number      IP Address    Role        State
     101        1    LEAF101      FDO23451A1B   10.0.72.64/32    leaf       active
Total 1 nodes`,q:{en:`What is the next step?`,hi:`Agla step kya hai?`},o:[{en:`Register the spine (serial FGE38482XTN); the leaves behind it will then be discovered`,hi:`Spine (serial FGE38482XTN) register karo; phir uske peeche ke leaves discover honge`},{en:`Reload LEAF102`,hi:`LEAF102 reload karo`},{en:`Configure IS-IS on the spine CLI`,hi:`Spine CLI par IS-IS configure karo`},{en:`Add LEAF102 to a VLAN pool`,hi:`LEAF102 ko VLAN pool mein jodo`}],a:0,w:{en:`Discovery moves outward one registered hop at a time: APIC → LEAF101 → spine → other leaves. Only an active spine relays LLDP/DHCP discovery for LEAF102.`,hi:`Discovery ek-ek registered hop bahar ki taraf chalti hai: APIC → LEAF101 → spine → baaki leaves. Sirf active spine hi LEAF102 ke liye LLDP/DHCP discovery relay karta hai.`}},{title:{en:`HTTP works one way only`,hi:`HTTP sirf ek taraf chalta hai`},ticket:{en:`Contract WEB-TO-APP (APP provides, WEB consumes) with filter HTTP-FLT (TCP destination 80). A capture on APP1 shows SYNs arriving from WEB1, but sessions never establish.`,hi:`Contract WEB-TO-APP (APP provide, WEB consume) filter HTTP-FLT (TCP destination 80) ke saath. APP1 par capture dikhata hai ki WEB1 se SYNs aa rahe hain, lekin sessions kabhi establish nahi hote.`},out:`Tenant NK-PROD > Contracts > WEB-TO-APP > Subject HTTP-SUBJ
  Filters: HTTP-FLT
  Apply Both Directions: True
  Reverse Filter Ports:  False

LEAF102# show logging ip access-list internal packet-loss
[ Tue Sep 29 11:02:17 2026 553190 usecs]: CName: NK-PROD:PROD(VXLAN: 2555904), VlanType: FD_VLAN, Vlan-Id: 16,
SMac: 0x005056010021, DMac:0x0022bdf819ff, SIP: 10.1.2.21, DIP: 10.1.1.11, SPort: 80, DPort: 49812, Src Intf: Ethernet1/2, Proto: 6, PktLen: 74`,q:{en:`Why are the sessions failing?`,hi:`Sessions kyun fail ho rahe hain?`},o:[{en:`The VRF is unenforced`,hi:`VRF unenforced hai`},{en:`WEB must also provide the contract`,hi:`WEB ko bhi contract provide karna hoga`},{en:`ARP flooding is disabled on APP-BD`,hi:`APP-BD par ARP flooding disabled hai`},{en:`Without Reverse Filter Ports, the reply (source port 80) does not match the return rule and is dropped`,hi:`Reverse Filter Ports ke bina reply (source port 80) return rule se match nahi hota aur drop hota hai`}],a:3,w:{en:`The drop log shows the SYN-ACK from APP1 with SPort 80. With Reverse Filter Ports off, the return rule still expects destination port 80. Turn it back on (or build an explicit return filter).`,hi:`Drop log APP1 se SPort 80 wala SYN-ACK dikhata hai. Reverse Filter Ports off hone par return rule abhi bhi destination port 80 expect karta hai. Ise wapas on karo (ya explicit return filter banao).`}},{title:{en:`Gateway unreachable, no faults`,hi:`Gateway unreachable, koi fault nahi`},ticket:{en:`APP1 (10.1.2.21/24, gateway 10.1.2.1) cannot ping its gateway. Its static port on LEAF102 eth1/2 is deployed and the APIC shows no faults.`,hi:`APP1 (10.1.2.21/24, gateway 10.1.2.1) apna gateway ping nahi kar pata. LEAF102 eth1/2 par uska static port deployed hai aur APIC koi fault nahi dikhata.`},out:`LEAF102# show ip interface brief vrf all
IP Interface Status for VRF "overlay-1"(4)
Interface            Address              Interface Status
lo0                  10.0.72.65/32        protocol-up/link-up/admin-up

IP Interface Status for VRF "NK-PROD:PROD"(5)
Interface            Address              Interface Status
vlan13               10.1.1.1/24          protocol-up/link-up/admin-up
vlan15               10.1.20.1/24         protocol-up/link-up/admin-up

LEAF102# show endpoint ip 10.1.2.21
(no entries)`,q:{en:`Most likely cause?`,hi:`Sabse likely cause?`},o:[{en:`A contract between APP and WEB is missing`,hi:`APP aur WEB ke beech contract missing hai`},{en:`The VLAN pool is too small`,hi:`VLAN pool chhota hai`},{en:`APP-BD has the wrong subnet (10.1.20.1/24 instead of 10.1.2.1/24), so there is no gateway and the IP is not learned`,hi:`APP-BD ka subnet galat hai (10.1.2.1/24 ki jagah 10.1.20.1/24), isliye gateway nahi hai aur IP learn nahi hota`},{en:`The spine is down`,hi:`Spine down hai`}],a:2,w:{en:`The pervasive gateway comes from the BD subnet. With the wrong subnet, 10.1.2.1 does not exist on the leaf, and Limit IP Learning To Subnet stops 10.1.2.21 from being learned. It is a valid configuration, so no fault is raised. Fix the BD subnet.`,hi:`Pervasive gateway BD subnet se aata hai. Galat subnet ke saath 10.1.2.1 leaf par exist nahi karta, aur Limit IP Learning To Subnet 10.1.2.21 ko learn hone se rokta hai. Configuration valid hai, isliye koi fault nahi aata. BD subnet theek karo.`}},{title:{en:`Invalid path on a brand-new server port`,hi:`Bilkul naye server port par invalid path`},ticket:{en:`A new AAEP NK-AAEP2 was built for rack 12 and ports 1/20-1/24 of leaf 104 were moved to policy group RACK12-PG. Since then the static port of EPG WEB on leaf 104 eth1/21 fails.`,hi:`Rack 12 ke liye naya AAEP NK-AAEP2 banaya gaya aur leaf 104 ke ports 1/20-1/24 policy group RACK12-PG par shift kiye gaye. Tab se leaf 104 eth1/21 par EPG WEB ka static port fail ho raha hai.`},out:`APIC1# show faults code F0467
 DN                : uni/tn-NK-PROD/ap-ECOM/epg-WEB/node-104/stpathatt-[eth1/21]/nwissues
 Description       : ... Invalid Path Configuration, debug message: invalid-path: Either the EpG is not
                     associated with a domain or the domain does not have this interface assigned to it

APIC1# moquery -c infraAttEntityP
# infra.AttEntityP
name         : NK-AAEP
dn           : uni/infra/attentp-NK-AAEP
domains      : NK-PHYS

# infra.AttEntityP
name         : NK-AAEP2
dn           : uni/infra/attentp-NK-AAEP2
domains      :`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Add physical domain NK-PHYS to AAEP NK-AAEP2`,hi:`AAEP NK-AAEP2 mein physical domain NK-PHYS jodo`},{en:`Add VLAN 110 to the VLAN pool again`,hi:`VLAN pool mein VLAN 110 dobara jodo`},{en:`Change the static port mode to Trunk`,hi:`Static port mode ko Trunk karo`},{en:`Delete and recreate EPG WEB`,hi:`EPG WEB delete karke dobara banao`}],a:0,w:{en:`invalid-path: the port now uses NK-AAEP2, which lists no domains, so the EPG's domain NK-PHYS is not allowed on that interface. Add the domain to the AAEP; the VLAN and mode are not the problem.`,hi:`invalid-path: port ab NK-AAEP2 use karta hai, jismein koi domain listed nahi, isliye EPG ka domain NK-PHYS us interface par allowed nahi. AAEP mein domain jodo; VLAN aur mode problem nahi hain.`}},{title:{en:`L3Out up, users still blocked`,hi:`L3Out up, users phir bhi blocked`},ticket:{en:`L3Out WAN-OUT is up: OSPF is FULL on border leaf 103, the WAN router has 10.1.1.0/24 and the compute leaves have 0.0.0.0/0. Users on the WAN still cannot reach the web servers on TCP 443, although contract WEB-PUBLIC is consumed by external EPG INTERNET.`,hi:`L3Out WAN-OUT up hai: border leaf 103 par OSPF FULL hai, WAN router ke paas 10.1.1.0/24 hai aur compute leaves ke paas 0.0.0.0/0 hai. WAN ke users phir bhi TCP 443 par web servers tak nahi pahunch paate, jabki contract WEB-PUBLIC external EPG INTERNET consume karta hai.`},out:`Tenant NK-PROD > Networking > L3Outs > WAN-OUT > External EPGs > INTERNET > Subnets
  IP Address   Scope
  0.0.0.0/0    Export Route Control Subnet

LEAF103# show logging ip access-list internal packet-loss
[ Tue Sep 29 12:20:44 2026 101874 usecs]: CName: NK-PROD:PROD(VXLAN: 2555904), VlanType: Unknown, Vlan-Id: 0,
SMac: 0x00a7420c1b02, DMac:0x0022bdf819ff, SIP: 198.51.100.77, DIP: 10.1.1.11, SPort: 51522, DPort: 443, Src Intf: Ethernet1/48, Proto: 6, PktLen: 74`,q:{en:`What should be changed?`,hi:`Kya badalna chahiye?`},o:[{en:`Change OSPF to BGP on the L3Out`,hi:`L3Out par OSPF ko BGP mein badlo`},{en:`Set the VRF to Unenforced`,hi:`VRF ko Unenforced karo`},{en:`Add a static route for 198.51.100.0/24 on leaf 101`,hi:`Leaf 101 par 198.51.100.0/24 ka static route jodo`},{en:`Tick "External Subnets for the External EPG" on 0.0.0.0/0 so outside sources are classified into INTERNET`,hi:`0.0.0.0/0 par "External Subnets for the External EPG" tick karo taaki bahar ke sources INTERNET mein classify hon`}],a:3,w:{en:`Routing is fine; classification is not. Export Route Control is a routing option. Without External Subnets for the External EPG, packets from 198.51.100.77 do not belong to INTERNET, so the contract never matches and the implicit deny drops them.`,hi:`Routing theek hai; classification nahi. Export Route Control routing option hai. External Subnets for the External EPG ke bina 198.51.100.77 se aaye packets INTERNET ke nahi hote, isliye contract kabhi match nahi hota aur implicit deny unhe drop kar deta hai.`}},{title:{en:`Changes rejected after a rack failure`,hi:`Rack failure ke baad changes reject`},ticket:{en:`A rack PDU failed and took down APIC 1 and APIC 2. Applications are working, but every attempt to create a new EPG on APIC 3 fails.`,hi:`Ek rack PDU fail hua aur APIC 1 aur APIC 2 ko band kar diya. Applications chal rahi hain, lekin APIC 3 par naya EPG banane ki har koshish fail ho rahi hai.`},out:`apic3# show controller
Fabric Name            : ACI-Fabric1
Operational Size       : 1
Cluster Size           : 3

 ID   Pod   Address          OOB IPv4           Status
 ---- ----- ---------------- ------------------ --------------
 1    1     10.0.0.1         192.168.100.11     unavailable
 2    1     10.0.0.2         192.168.100.12     unavailable
 3*   1     10.0.0.3         192.168.100.13     available`,q:{en:`What explains the behaviour, and what is the right action?`,hi:`Behaviour ki wajah kya hai, aur sahi action kya hai?`},o:[{en:`The leaves lost their policy; reload them so they download it again`,hi:`Leaves ne apni policy kho di; unhe reload karo taaki dobara download karein`},{en:`APIC 3 needs a larger TEP pool`,hi:`APIC 3 ko bada TEP pool chahiye`},{en:`APIC 3 holds only a minority of each shard, so its data is read-only; restore APIC 1 or 2 and leave the leaves alone`,hi:`APIC 3 ke paas har shard ka sirf minority hai, isliye uska data read-only hai; APIC 1 ya 2 restore karo aur leaves ko mat chhedo`},{en:`Delete the tenant and recreate it on APIC 3`,hi:`Tenant delete karke APIC 3 par dobara banao`}],a:2,w:{en:`Each shard has three replicas; writes need a majority. With two APICs down, the survivor is in the minority and read-only. The data plane is unaffected. Reloading leaves now would be harmful, because a booting leaf needs a healthy APIC for its policy.`,hi:`Har shard ke teen replicas hain; writes ko majority chahiye. Do APIC down hone par bacha hua minority mein aur read-only hai. Data plane par asar nahi. Abhi leaves reload karna nuksaan karega, kyunki boot hota leaf apni policy ke liye healthy APIC par depend karta hai.`}}];export{e as default};