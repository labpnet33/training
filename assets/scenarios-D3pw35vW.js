var e=[{title:{en:`Key rotation command is refused`,hi:`Key rotation command refuse ho raha hai`},ticket:{en:`Security asked for the NK-STAFF passphrase NkStaff2025. You paste the new key on WLC1 but the old key keeps working.`,hi:`Security ne NK-STAFF passphrase NkStaff2025 maanga. Aap WLC1 par nayi key paste karte ho lekin purani key chalti rehti hai.`},out:`WLC1(config)# wlan NK-STAFF
WLC1(config-wlan)# security wpa psk set-key ascii 0 NkStaff2025
% Cannot modify the WLAN while it is enabled. Use 'shutdown' on the WLAN first.

WLC1# show wlan summary
ID   Profile Name    SSID          Status   Security
1    NK-STAFF        NK-STAFF      UP       [WPA2][PSK][AES]`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Recreate the policy tag PT-CAMPUS`,hi:`Policy tag PT-CAMPUS dobara banao`},{en:`shutdown the WLAN, set the key, no shutdown, then test new and old keys`,hi:`WLAN shutdown, key set, no shutdown, phir nayi aur purani key test karo`},{en:`Change the key under PP-STAFF`,hi:`PP-STAFF ke andar key badlo`},{en:`Change the RADIUS secret`,hi:`RADIUS secret badlo`}],a:1,w:{en:`The WLAN owns the security and must be disabled before it is edited. Re-enable it and prove the new key works and the old one fails.`,hi:`Security WLAN ki hoti hai aur edit se pehle disable karna padta hai. Re-enable karo aur prove karo nayi key chalti hai aur purani fail hoti hai.`}},{title:{en:`Corporate users time out`,hi:`Corporate users timeout ho rahe hain`},ticket:{en:`NK-CORP stopped working after RAD1 was rebuilt. alice sees "RADIUS server did not respond". The AAA lists exist. You collect evidence.`,hi:`RAD1 rebuild hone ke baad NK-CORP band ho gaya. alice ko "RADIUS server did not respond" dikhta hai. AAA lists exist karti hain. Aap evidence collect karte ho.`},out:`WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests 0, timeouts 4

WLC1# show logging
%DOT1X-3-SERVER_TIMEOUT: Client 0050.7966.6801 on WLAN 2 (NK-CORP): RADIUS server not responding (check address, port and shared secret)

WLC1# ping 10.10.60.20
!!!!!   Success rate is 100 percent (5/5)`,q:{en:`What is the best next step?`,hi:`Agla best step kya hai?`},o:[{en:`Change alice password`,hi:`alice ka password badlo`},{en:`Recreate the WLAN NK-CORP`,hi:`WLAN NK-CORP dobara banao`},{en:`Add VLAN 40 to the controller`,hi:`Controller mein VLAN 40 add karo`},{en:`Re-enter the shared secret under radius server RAD1 (key 0 NkRadius1)`,hi:`radius server RAD1 ke andar shared secret dobara enter karo (key 0 NkRadius1)`}],a:3,w:{en:`Reachability and port are fine, requests are not answered and timeouts grow: classic key mismatch. Fix the secret only.`,hi:`Reachability aur port theek hain, requests ka jawab nahi aur timeouts badh rahe hain: classic key mismatch. Sirf secret fix karo.`}},{title:{en:`Bad password versus bad secret`,hi:`Bad password versus bad secret`},ticket:{en:`Two users fail on NK-CORP. Compare the evidence and decide which statement is true.`,hi:`NK-CORP par do users fail hote hain. Evidence compare karo aur decide karo kaunsa statement sahi hai.`},out:`LAPTOP2> wifi connect NK-CORP user bob password WrongPass9
Authentication failed: RADIUS Access-Reject for user bob.

WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests 3, timeouts 0

WLC1# show logging
%DOT1X-4-AUTH_REJECT: Client 0050.7966.6802 user bob rejected by RADIUS server 10.10.60.20 on WLAN 2 (NK-CORP)`,q:{en:`What does this evidence show?`,hi:`Yeh evidence kya dikhata hai?`},o:[{en:`The server answered; the credentials are wrong, so the shared secret is fine`,hi:`Server ne jawab diya; credentials galat hain, to shared secret theek hai`},{en:`The shared secret is wrong`,hi:`Shared secret galat hai`},{en:`RAD1 is unreachable`,hi:`RAD1 unreachable hai`},{en:`aaa new-model is missing`,hi:`aaa new-model missing hai`}],a:0,w:{en:`Requests are answered and an Access-Reject is logged. The path and secret work, so fix the credentials, not the controller.`,hi:`Requests ka jawab mil raha hai aur Access-Reject log hua. Path aur secret kaam karte hain, to credentials fix karo, controller nahi.`}},{title:{en:`AAA chain incomplete`,hi:`AAA chain incomplete hai`},ticket:{en:`You built NK-CORP but every client fails with "no RADIUS server configured for the WLAN".`,hi:`Aapne NK-CORP banaya lekin har client "no RADIUS server configured for the WLAN" ke saath fail hota hai.`},out:`WLC1# show running-config | section aaa|radius
radius server RAD1
 address ipv4 10.10.60.20 auth-port 1812 acct-port 1813
 key 0 NkRadius1
aaa new-model
aaa group server radius RG-NK
aaa authentication dot1x NK-DOT1X group RG-NK

WLC1# show radius server-group all
Server group RG-NK
    Sharing Server Group: none`,q:{en:`Which object is missing?`,hi:`Kaunsa object missing hai?`},o:[{en:`A second WLAN`,hi:`Doosra WLAN`},{en:`The policy tag`,hi:`Policy tag`},{en:`server name RAD1 inside the group RG-NK`,hi:`Group RG-NK ke andar server name RAD1`},{en:`A new AP profile`,hi:`Naya AP profile`}],a:2,w:{en:`The group RG-NK has no servers, so the method list points to an empty group and the WLAN has nobody to ask.`,hi:`Group RG-NK mein koi server nahi, to method list khali group ko point karti hai aur WLAN ke paas poochne wala koi nahi.`}},{title:{en:`Corporate WLAN not visible`,hi:`Corporate WLAN visible nahi`},ticket:{en:`The AAA chain works and the WLAN is UP, but staff cannot see NK-CORP on any AP.`,hi:`AAA chain kaam karti hai aur WLAN UP hai, lekin staff ko kisi AP par NK-CORP nahi dikhta.`},out:`WLC1# show wlan summary
2    NK-CORP         NK-CORP       UP       [WPA2][802.1X][AES]

WLC1# show wireless tag policy detailed PT-CAMPUS
Policy Tag Name   : PT-CAMPUS
Number of WLAN-POLICY maps: 1
WLAN Profile Name    Policy Name
NK-STAFF             PP-STAFF

WLC1# show wireless profile policy summary
PP-STAFF   Enabled   VLAN 20
PP-CORP    Disabled  VLAN 40`,q:{en:`What must you do?`,hi:`Aapko kya karna hai?`},o:[{en:`Change the RADIUS key`,hi:`RADIUS key badlo`},{en:`Enable PP-CORP and map NK-CORP to PP-CORP in PT-CAMPUS`,hi:`PP-CORP enable karo aur PT-CAMPUS mein NK-CORP ko PP-CORP se map karo`},{en:`Rotate the staff key`,hi:`Staff key rotate karo`},{en:`Reboot both APs`,hi:`Dono APs reboot karo`}],a:1,w:{en:`The tag has no NK-CORP entry and PP-CORP is shut down, so no AP broadcasts the WLAN. UP only means the WLAN is enabled.`,hi:`Tag mein NK-CORP ki entry nahi aur PP-CORP shut hai, to koi AP WLAN broadcast nahi karta. UP ka matlab sirf WLAN enabled hai.`}},{title:{en:`Old handsets fail after a WPA3 move`,hi:`WPA3 move ke baad purane handsets fail`},ticket:{en:`Voice handsets could join NK-VOICE until the SSID was changed to WPA3-SAE only. The handsets support WPA2-AES only.`,hi:`NK-VOICE ko WPA3-SAE only mein badalne tak voice handsets join karte the. Handsets sirf WPA2-AES support karte hain.`},out:`WLC1# show wlan summary
4    NK-VOICE        NK-VOICE      UP       [WPA3][SAE][AES]

PHONE1> wifi connect NK-VOICE psk NkVoice2024
Authentication failed: security mismatch with the WLAN.`,q:{en:`Which is the safest repair that keeps handsets working?`,hi:`Handsets chalte rakhne wala safest repair kaunsa hai?`},o:[{en:`Make the AP country code IN`,hi:`AP country code IN karo`},{en:`Move the handsets to VLAN 99`,hi:`Handsets ko VLAN 99 mein daalo`},{en:`Shut the WLAN, return to WPA2 PSK with AES (or use transition mode), then enable it`,hi:`WLAN shut karo, AES ke saath WPA2 PSK par wapas jao (ya transition mode use karo), phir enable karo`},{en:`Disable the RADIUS server`,hi:`RADIUS server disable karo`}],a:2,w:{en:`Clients that cannot do SAE or PMF need WPA2 or transition mode. Edit security only with the WLAN shut down. Plan device replacement before WPA3-only.`,hi:`Jo clients SAE ya PMF nahi kar sakte unhe WPA2 ya transition mode chahiye. Security sirf WLAN shut karke edit karo. WPA3-only se pehle device replacement plan karo.`}},{title:{en:`Monday: two faults at once`,hi:`Monday: ek saath do faults`},ticket:{en:`After a weekend change staff on NK-STAFF cannot connect and corporate users time out. You review both pieces of evidence.`,hi:`Weekend change ke baad NK-STAFF par staff connect nahi kar pa rahe aur corporate users timeout ho rahe hain. Aap dono evidence dekhte ho.`},out:`WLC1# show wlan summary
1    NK-STAFF        NK-STAFF      DOWN     [WPA2][PSK][AES]
2    NK-CORP         NK-CORP       UP       [WPA2][802.1X][AES]

WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests 0, timeouts 6`,q:{en:`What is the correct plan?`,hi:`Sahi plan kya hai?`},o:[{en:`Rotate the passphrase again`,hi:`Passphrase dobara rotate karo`},{en:`Delete NK-CORP`,hi:`NK-CORP delete karo`},{en:`Change the policy tag only`,hi:`Sirf policy tag badlo`},{en:`Run no shutdown on NK-STAFF and re-enter the RADIUS key on RAD1, proving each with a client`,hi:`NK-STAFF par no shutdown chalao aur RAD1 par RADIUS key dobara enter karo, har ek ko client se prove karo`}],a:3,w:{en:`Two objects, two faults: the staff WLAN was left shut after a security edit, and RAD1 times out because of the secret. Fix each on its own object.`,hi:`Do objects, do faults: security edit ke baad staff WLAN shut reh gaya, aur RAD1 secret ki wajah se timeout karta hai. Har ek apne object par fix karo.`}}];export{e as default};