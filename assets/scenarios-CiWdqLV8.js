var e=(e,t,n,r,i,a,o,s,c,l,u)=>({title:{en:e,hi:t},ticket:{en:n,hi:r},out:i,q:{en:a,hi:o},o:s.map(([e,t])=>({en:e,hi:t})),a:c,w:{en:l,hi:u}}),t=[e(`Authenticated, but the role is not found`,`Authenticated, par role nahi mila`,`ClearPass accepts alice but LAPTOP1 has no network. The switch log says a returned role is not defined.`,`ClearPass alice ko accept karta hai par LAPTOP1 ko network nahi. Switch log kehta hai ki returned role defined nahi hai.`,`ACCESS# show port-access clients detail
Client 00:50:2f:e9:9a:01, alice
  Port    : 1/1/3
  Status  : unauthorized
  Reason  : RADIUS-returned role "Employee" is not defined on this switch

CPPM Access Tracker detail latest output
  Radius:Aruba:Aruba-User-Role = Employee`,`What is the correct repair?`,`Sahi repair kaunsa hai?`,[[`Change EP-EMPLOYEE to return EMPLOYEE, then reauthenticate`,`EP-EMPLOYEE ko EMPLOYEE return karne par badlo, phir reauthenticate karo`],[`Rename the switch role to Employee on every switch`,`Har switch par role ka naam Employee karo`],[`Reset alice password`,`Alice ka password reset karo`],[`Add VLAN 10 to the router`,`Router par VLAN 10 add karo`]],0,`ClearPass returned a role name that differs in case. Change the object that is out of line (the profile) and reauthenticate.`,`ClearPass ne aisa role name bheja jo case mein alag hai. Jo object line se bahar hai (profile) use badlo aur reauthenticate karo.`),e(`Authorized in VLAN 1`,`VLAN 1 mein authorized`,`Alice and Bob authenticate but have no address. The site assigns VLANs with standard attributes.`,`Alice aur Bob authenticate hote hain par address nahi. Site VLANs standard attributes se assign karti hai.`,`ACCESS# show port-access clients
1/1/3  00:50:2f:e9:9a:01  authorized  -  1  dot1x
1/1/4  00:50:2f:e9:9a:02  authorized  -  1  dot1x

CPPM Access Tracker detail latest output
  Radius:IETF:Tunnel-Private-Group-Id = 10`,`What is missing?`,`Kya missing hai?`,[[`A new DHCP scope`,`Naya DHCP scope`],[`Tunnel-Type VLAN (13) and Tunnel-Medium-Type 802 (6) beside the Group-Id`,`Group-Id ke saath Tunnel-Type VLAN (13) aur Tunnel-Medium-Type 802 (6)`],[`Aruba-User-Role GUEST`,`Aruba-User-Role GUEST`],[`A second RADIUS server`,`Doosra RADIUS server`]],1,`The switch ignores an incomplete set and leaves the port in VLAN 1. Add all three, for example with the VLAN template, and bounce the ports.`,`Switch incomplete set ignore karta hai aur port VLAN 1 mein chhodta hai. Teeno add karo, jaise VLAN template se, aur ports bounce karo.`),e(`Printer never gets an address`,`Printer ko address nahi milta`,`PRN1 on 1/1/5 gets nothing. The port has dot1x and mac-auth enabled and the role IOT exists on the switch.`,`PRN1 ko 1/1/5 par kuch nahi milta. Port par dot1x aur mac-auth enabled hain aur switch par role IOT hai.`,`CPPM Access Tracker detail 00:50:67:fb:67:01 alerts
  Service    : (none)
  Error      : 9002 Failed to classify request to service

CPPM configuration service show
  Wired 802.1X   enabled
  (no MAC authentication service)`,`What do you build first?`,`Pehle kya banate ho?`,[[`A new VLAN 30`,`Naya VLAN 30`],[`A second printer`,`Doosra printer`],[`The Wired MAC Auth service from the template, then the known endpoint with Category Printer`,`Template se Wired MAC Auth service, phir Category Printer ke saath known endpoint`],[`Disable 802.1X globally`,`802.1X globally disable karo`]],2,`There is no service to classify a MAC authentication request. Create it, bind RM-MAC and EPOL-MAC, and add the endpoint so the lookup succeeds.`,`MAC authentication request classify karne ke liye koi service nahi hai. Use banao, RM-MAC aur EPOL-MAC bind karo, aur endpoint add karo taaki lookup succeed ho.`),e(`Contractors offline after a clean-up`,`Clean-up ke baad contractors offline`,`ClearPass returns CONTRACTOR for bob, yet LAPTOP2 stays unauthorized since the weekend.`,`ClearPass bob ke liye CONTRACTOR return karta hai, phir bhi weekend se LAPTOP2 unauthorized hai.`,`ACCESS# show port-access role CONTRACTOR
Role CONTRACTOR   VLAN access: 20   VLAN status: not present

ACCESS# show vlan
10 EMPLOYEE
30 IOT
40 GUEST
50 QUARANTINE
99 INFRA`,`What is the first fix?`,`Pehla fix kya hai?`,[[`Change the ClearPass profile to return VLAN 10`,`ClearPass profile ko VLAN 10 return karne par badlo`],[`Recreate VLAN 20 named CONTRACTOR, then check it is allowed on the uplink trunk`,`VLAN 20 naam CONTRACTOR ke saath dobara banao, phir check karo ki uplink trunk par allowed hai`],[`Delete the role`,`Role delete karo`],[`Reboot ClearPass`,`ClearPass reboot karo`]],1,`A role whose VLAN does not exist cannot be applied. After recreating it, the trunk allowed list may be the second fault.`,`Jis role ka VLAN exist nahi karta woh apply nahi hota. Dobara banane ke baad trunk allowed list doosra fault ho sakti hai.`),e(`Nothing in the Access Tracker`,`Access Tracker mein kuch nahi`,`A new switch cannot authenticate anyone. The Access Tracker is empty. The switch shows its RADIUS server unreachable.`,`Naya switch kisi ko authenticate nahi kar pa raha. Access Tracker khaali hai. Switch apna RADIUS server unreachable dikhata hai.`,`ACCESS# show radius-server
Server 10.20.60.10  Port 1812  Status: unreachable

CPPM monitoring event-viewer
  RADIUS request dropped: shared secret mismatch for device ACCESS (10.20.99.2)`,`What is the fix?`,`Fix kya hai?`,[[`Create more services`,`Aur services banao`],[`Add users`,`Users add karo`],[`Change VLAN numbers`,`VLAN numbers badlo`],[`Make the secret on the network device identical to the switch key`,`Network device par secret ko switch key ke identical karo`]],3,`A secret mismatch is silently dropped, so no record is written. Equalise the secrets and retest.`,`Secret mismatch chupchaap drop hota hai, isliye record nahi likha jaata. Secrets barabar karo aur dobara test karo.`),e(`Everyone ends up as GUEST`,`Sab GUEST ban jaate hain`,`After a pilot, every wired login lands in the GUEST role in VLAN 40.`,`Pilot ke baad har wired login VLAN 40 mein GUEST role mein pahunchta hai.`,`CPPM monitoring access-tracker detail latest summary
  Service     : Wired Allow-All Test
  Enforcement : EP-GUEST

CPPM configuration service show
  1 Wired Allow-All Test  enabled
  2 Wired 802.1X          enabled`,`What do you change?`,`Kya badalte ho?`,[[`Put Wired 802.1X first (or disable the test service) and bounce the ports`,`Wired 802.1X ko pehle rakho (ya test service disable karo) aur ports bounce karo`],[`Change the GUEST VLAN to 10`,`GUEST VLAN ko 10 karo`],[`Delete the roles on the switch`,`Switch par roles delete karo`],[`Change the shared secret`,`Shared secret badlo`]],0,`Services are first match. The test service above production handles every request.`,`Services first match hoti hain. Production ke upar test service har request handle karti hai.`),e(`Printer rejected after a loss report`,`Loss report ke baad printer reject`,`Ports 1/1/3 to 1/1/5 now run both methods. Laptops work but PRN1 is still rejected.`,`Ports 1/1/3 se 1/1/5 par ab dono methods chalte hain. Laptops chalte hain par PRN1 abhi bhi reject hai.`,`CPPM monitoring access-tracker detail 00:50:67:fb:67:01 alerts
  Service : Wired MAC Auth
  Result  : REJECT
  Alert   : endpoint status disabled

CPPM configuration identity endpoint show
  00:50:67:fb:67:01  disabled  Category=Printer`,`What is the right action after the printer is recovered?`,`Printer recover hone ke baad sahi action kya hai?`,[[`Enable 802.1X on 1/1/5 only`,`Sirf 1/1/5 par 802.1X enable karo`],[`Remove mac-auth from the ports`,`Ports se mac-auth hatao`],[`Set the endpoint status back to known on ClearPass and verify role IOT in VLAN 30`,`ClearPass par endpoint status wapas known karo aur role IOT VLAN 30 mein verify karo`],[`Change the printer MAC on the switch`,`Switch par printer MAC badlo`]],2,`The cause is the endpoint status in the repository, so recover it there and prove the result on the switch.`,`Cause repository mein endpoint status hai, isliye use wahin recover karo aur switch par result prove karo.`)];export{t as default};