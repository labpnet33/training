var e=[{title:{en:`Nobody can see NK-STAFF`,hi:`Kisi ko NK-STAFF nahi dikhta`},ticket:{en:`Helpdesk: "Since this morning NK-STAFF has disappeared from every laptop and phone in the building. The APs have power and their LEDs look normal." show ap summary lists all three APs as joined.`,hi:`Helpdesk: "Aaj subah se building ke har laptop aur phone se NK-STAFF gayab hai. APs ko power mil rahi hai aur unki LEDs normal dikhti hain." show ap summary teeno APs ko joined dikhata hai.`},out:`(WLC1) >show wlan summary

Number of WLANs.................................. 1

WLAN ID  WLAN Profile Name / SSID          Status    Interface Name    Security
-------  --------------------------------  --------  ----------------  --------------------
1        STAFF / NK-STAFF                  Disabled  staff             WPA2-Personal (PSK)

LAPTOP1> wifi scan
SSID              BSSID              Band    Ch   Signal   Security              AP
(no networks found - is an AP joined, a WLAN enabled and a radio on?)`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Change the AP switch ports to trunks`,hi:`AP switch ports ko trunks mein badlo`},{en:`Change the pre-shared key on the WLAN`,hi:`WLAN par pre-shared key badlo`},{en:`Enable WLAN 1 with config wlan enable 1`,hi:`config wlan enable 1 se WLAN 1 enable karo`},{en:`Move all APs to channel 6`,hi:`Saare APs ko channel 6 par le jaao`}],a:2,w:{en:`The APs are joined, but a disabled WLAN is not broadcast by any AP, so no client can see the SSID. Enabling the WLAN restores beacons. Security, channels and port modes do not hide an SSID from every client.`,hi:`APs joined hain, par disabled WLAN koi AP broadcast nahi karta, isliye koi client SSID nahi dekh sakta. WLAN enable karne se beacons wapas aate hain. Security, channels aur port modes har client se SSID nahi chhupate.`}},{title:{en:`One laptop keeps asking for the password`,hi:`Ek laptop baar baar password maangta hai`},ticket:{en:`User: "My laptop sees NK-STAFF but keeps saying it cannot connect. My colleague's phone next to me works." The laptop's MAC is 52:54:00:aa:00:01.`,hi:`User: "Mera laptop NK-STAFF dekhta hai par baar baar kehta hai connect nahi ho sakta. Mere bagal mein colleague ka phone chalta hai." Laptop ka MAC 52:54:00:aa:00:01 hai.`},out:`(WLC1) >show msglog

Sep 29 08:02:11.482 %APF-4-AUTH_FAIL: Client 52:54:00:aa:00:01 failed PSK authentication on WLAN 1 (NK-STAFF) via AP AP1: MIC failure in 4-way handshake (wrong pre-shared key)
Sep 29 08:02:09.107 %APF-6-CLIENT_ASSOC: Client 52:54:00:aa:00:02 associated to AP AP1 (2.4 GHz ch 1) on WLAN 1 (NK-STAFF), interface staff VLAN 20

LAPTOP1> wifi status
Not connected. Saved profile: NK-STAFF (auto-connect paused after an authentication failure)
Last attempt: NK-STAFF failed (psk)`,q:{en:`What is the most likely cause and fix?`,hi:`Sabse sambhav wajah aur fix kya hai?`},o:[{en:`The laptop has the wrong passphrase saved; reconnect it with the correct key`,hi:`Laptop mein galat passphrase saved hai; sahi key ke saath reconnect karo`},{en:`The WLAN is disabled; enable it`,hi:`WLAN disabled hai; enable karo`},{en:`The DHCP pool for VLAN 20 is exhausted`,hi:`VLAN 20 ka DHCP pool khatam ho gaya hai`},{en:`AP1 is on an overlapping channel`,hi:`AP1 overlapping channel par hai`}],a:0,w:{en:`A MIC failure in the 4-way handshake means the two sides derived different keys from different passphrases. The phone on the same WLAN works, so the WLAN, AP and DHCP are fine. Fix the saved key on the laptop, for example wifi connect NK-STAFF psk NkStaff2024.`,hi:`4-way handshake mein MIC failure ka matlab dono taraf alag passphrase se alag keys bani. Same WLAN par phone chalta hai, isliye WLAN, AP aur DHCP theek hain. Laptop par saved key theek karo, jaise wifi connect NK-STAFF psk NkStaff2024.`}},{title:{en:`Staff laptops land in the guest subnet`,hi:`Staff laptops guest subnet mein pahunchte hain`},ticket:{en:`After last night's change, staff on NK-STAFF receive 10.10.30.x addresses and cannot open the file server 10.10.50.10. Internet browsing works.`,hi:`Kal raat ke change ke baad NK-STAFF par staff ko 10.10.30.x addresses milte hain aur woh file server 10.10.50.10 nahi khol paate. Internet browsing chalti hai.`},out:`(WLC1) >show wlan 1

WLAN Identifier.................................. 1
Profile Name..................................... STAFF
Network Name (SSID).............................. NK-STAFF
Status........................................... Enabled
Interface........................................ guest

(WLC1) >show interface summary

Interface Name        Port  Vlan Id   IP Address       Type     Ap Mgr  Guest
--------------------  ----  --------  ---------------  -------  ------  -----
management            1     99        10.10.99.10      Static   Yes     No
staff                 1     20        10.10.20.5       Dynamic  No      No
guest                 1     30        10.10.30.5       Dynamic  No      No`,q:{en:`What should you change?`,hi:`Aapko kya badalna chahiye?`},o:[{en:`Remove the GUEST-IN ACL from R1`,hi:`R1 se GUEST-IN ACL hatao`},{en:`Change the DHCP pool on R1 to hand out 10.10.20.x in VLAN 30`,hi:`R1 par DHCP pool badlo taaki VLAN 30 mein 10.10.20.x de`},{en:`Disable and re-enable WLAN 1`,hi:`WLAN 1 ko disable karke phir enable karo`},{en:`Map WLAN 1 to the staff interface with config wlan interface 1 staff`,hi:`config wlan interface 1 staff se WLAN 1 ko staff interface se map karo`}],a:3,w:{en:`The WLAN is mapped to the guest interface (VLAN 30), so staff get guest addresses and the guest ACL correctly blocks internal subnets. Remapping to staff (VLAN 20) fixes the root cause. Removing the guest ACL would open internal servers to guests, and bending DHCP hides the wrong mapping.`,hi:`WLAN guest interface (VLAN 30) se mapped hai, isliye staff ko guest addresses milte hain aur guest ACL sahi tarah internal subnets block karta hai. Staff (VLAN 20) par remap karna root cause theek karta hai. Guest ACL hatane se internal servers guests ke liye khul jaate, aur DHCP ko modna galat mapping chhupata hai.`}},{title:{en:`Fast when empty, crawling when full`,hi:`Khaali mein tez, bhare mein rengta`},ticket:{en:`Trainers report the hall Wi-Fi is fine before class and unusable once 40 students connect. Every seat shows a strong signal.`,hi:`Trainers report karte hain ki hall ka Wi-Fi class se pehle theek hai aur 40 students connect hote hi bekaar. Har seat par strong signal dikhta hai.`},out:`(WLC1) >show advanced 802.11b channel

802.11b/g/n (2.4 GHz) channel plan   (non-overlapping 20 MHz channels: 1, 6, 11)
Network status................................... Enabled

AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
-------------  -------  --------  -----------  --------  ----------------------
AP1            1        2412      1 (20 dBm)   Up        AP2(1) AP3(1)
AP2            1        2412      1 (20 dBm)   Up        AP1(1) AP3(1)
AP3            1        2412      1 (20 dBm)   Up        AP1(1) AP2(1)

Interference: 3 AP pair(s) on overlapping channels
  AP1 <-> AP2     ch 1/1     -58 dBm   21 m   co-channel
  AP1 <-> AP3     ch 1/1     -71 dBm   42 m   co-channel
  AP2 <-> AP3     ch 1/1     -58 dBm   21 m   co-channel`,q:{en:`What is the best fix for 2.4 GHz?`,hi:`2.4 GHz ke liye best fix kya hai?`},o:[{en:`Raise all APs to maximum power`,hi:`Saare APs ko maximum power par karo`},{en:`Put AP1, AP2 and AP3 on channels 1, 6 and 11`,hi:`AP1, AP2 aur AP3 ko channels 1, 6 aur 11 par daalo`},{en:`Bond 2.4 GHz to 40 MHz for more speed`,hi:`Zyada speed ke liye 2.4 GHz ko 40 MHz mein bond karo`},{en:`Put AP1, AP2 and AP3 on channels 1, 2 and 3`,hi:`AP1, AP2 aur AP3 ko channels 1, 2 aur 3 par daalo`}],a:1,w:{en:`All three cells share channel 1, so they form one contention domain and share one channel's airtime. Channels 1, 6 and 11 are the only non-overlapping set. More power makes contention worse, 40 MHz on 2.4 GHz overlaps everything, and 1/2/3 creates adjacent-channel interference.`,hi:`Teeno cells channel 1 share karte hain, isliye woh ek contention domain bante hain aur ek channel ka airtime share karte hain. Channels 1, 6 aur 11 hi non-overlapping set hai. Zyada power contention badhati hai, 2.4 GHz par 40 MHz sab se overlap karta hai, aur 1/2/3 adjacent-channel interference banata hai.`}},{title:{en:`A channel plan that looks different but still fails`,hi:`Channel plan jo alag dikhta hai par phir bhi fail`},ticket:{en:`A junior engineer "fixed" the hall by giving each AP a different 2.4 GHz channel. Users now see many retries and throughput is even worse than before.`,hi:`Ek junior engineer ne har AP ko alag 2.4 GHz channel dekar hall "theek" kiya. Users ab bahut retries dekhte hain aur throughput pehle se bhi bura hai.`},out:`(WLC1) >show advanced 802.11b channel

AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
-------------  -------  --------  -----------  --------  ----------------------
AP1            1        2412      1 (20 dBm)   Up        AP2(3)
AP2            3        2422      1 (20 dBm)   Up        AP1(1) AP3(6)
AP3            6        2437      1 (20 dBm)   Up        AP2(3)

Interference: 2 AP pair(s) on overlapping channels
  AP1 <-> AP2     ch 1/3     -58 dBm   21 m   adjacent-channel overlap
  AP2 <-> AP3     ch 3/6     -58 dBm   21 m   adjacent-channel overlap`,q:{en:`Why is it worse, and what is the correct plan?`,hi:`Yeh zyada bura kyun hai, aur sahi plan kya hai?`},o:[{en:`Channel 3 is illegal in India; use channel 13 instead`,hi:`India mein channel 3 illegal hai; iski jagah channel 13 use karo`},{en:`Different channels always help; lower the power instead`,hi:`Alag channels hamesha madad karte hain; iski jagah power kam karo`},{en:`Overlapping channels corrupt each other's frames; use 1, 6 and 11`,hi:`Overlapping channels ek doosre ke frames corrupt karte hain; 1, 6 aur 11 use karo`},{en:`Adjacent channels are fine; the problem is DFS on channel 3`,hi:`Adjacent channels theek hain; problem channel 3 par DFS hai`}],a:2,w:{en:`Channels 1, 3 and 6 overlap, so the APs cannot decode each other, do not defer, and their energy corrupts frames: adjacent-channel interference, worse than sharing a channel. The non-overlapping set is 1, 6 and 11. DFS applies only to certain 5 GHz channels.`,hi:`Channels 1, 3 aur 6 overlap karte hain, isliye APs ek doosre ko decode nahi kar sakte, rukte nahi, aur unki energy frames corrupt karti hai: adjacent-channel interference, channel share karne se bura. Non-overlapping set 1, 6 aur 11 hai. DFS sirf kuch 5 GHz channels par lagta hai.`}},{title:{en:`Enterprise WLAN: nobody can log in`,hi:`Enterprise WLAN: koi login nahi kar pa raha`},ticket:{en:`The new NK-CORP WLAN uses WPA2-Enterprise. Every user gets "authentication failed". The RADIUS team says their server at 10.10.50.20 listens on UDP 1812 and sees no requests arriving at all.`,hi:`Naya NK-CORP WLAN WPA2-Enterprise use karta hai. Har user ko "authentication failed" milta hai. RADIUS team kehti hai unka server 10.10.50.20 UDP 1812 par sunta hai aur use koi request aati hi nahi dikhti.`},out:`(WLC1) >show msglog

Sep 29 10:41:07.220 %DOT1X-3-SERVER_TIMEOUT: Client 52:54:00:aa:00:07 on WLAN 2 (NK-CORP): RADIUS server not responding (check address, port and shared secret)

(WLC1) >show radius summary

Authentication Servers

Idx  Server Address   Port   State     Requests  Timeouts
---  ---------------  -----  --------  --------  --------
1    10.10.50.20      1645   Enabled   42        42`,q:{en:`What is the most likely fix?`,hi:`Sabse sambhav fix kya hai?`},o:[{en:`Reconfigure RADIUS server 1 on the WLC to use port 1812`,hi:`WLC par RADIUS server 1 ko port 1812 use karne ke liye reconfigure karo`},{en:`Change the WLAN to WPA2-Personal`,hi:`WLAN ko WPA2-Personal mein badlo`},{en:`Reset every user's password`,hi:`Har user ka password reset karo`},{en:`Move the APs to FlexConnect mode`,hi:`APs ko FlexConnect mode mein le jaao`}],a:0,w:{en:`Every request times out and the server sees nothing: the WLC sends to UDP 1645, an old RADIUS port, while the server listens on 1812. Fix the port (and confirm the shared secret). User passwords are irrelevant when no request reaches the server, and downgrading to PSK throws away per-user security.`,hi:`Har request time out hoti hai aur server ko kuch nahi dikhta: WLC UDP 1645, ek purana RADIUS port, par bhejta hai jabki server 1812 par sunta hai. Port theek karo (aur shared secret confirm karo). Jab koi request server tak pahunchti hi nahi to user passwords irrelevant hain, aur PSK par jaana per-user security phenk deta hai.`}},{title:{en:`Video freezes in the back row`,hi:`Peeche ki row mein video freeze`},ticket:{en:`A student in the back row, directly under AP3, says video lessons freeze. His laptop has been connected since he arrived at the front door, near AP1.`,hi:`Peeche ki row mein, theek AP3 ke neeche, ek student kehta hai video lessons freeze hote hain. Uska laptop tab se connected hai jab woh AP1 ke paas main darwaze par aaya tha.`},out:`(WLC1) >show client detail 52:54:00:aa:00:05

Client MAC Address............................... 52:54:00:aa:00:05
AP Name.......................................... AP1
Client State..................................... Associated
BSSID............................................ 52:54:00:3a:11:00
Radio............................................ 802.11b/g/n (2.4 GHz)
Channel.......................................... 1
IP Address....................................... 10.10.20.15
Radio Signal Strength Indicator.................. -79 dBm

LAPTOP5> wifi scan
SSID              BSSID              Band    Ch   Signal   Security              AP
NK-STAFF          52:54:00:3a:13:10  5 GHz   44   -50 dBm  WPA2-Personal (PSK)   AP3
NK-STAFF          52:54:00:3a:13:00  2.4 GHz 11   -46 dBm  WPA2-Personal (PSK)   AP3
NK-STAFF          52:54:00:3a:11:00  2.4 GHz 1    -79 dBm  WPA2-Personal (PSK)   AP1`,q:{en:`What is happening?`,hi:`Kya ho raha hai?`},o:[{en:`AP3 is broken and must be replaced`,hi:`AP3 kharab hai aur badalna padega`},{en:`The WLAN is mapped to the wrong VLAN`,hi:`WLAN galat VLAN se mapped hai`},{en:`The PSK on the laptop is wrong`,hi:`Laptop par PSK galat hai`},{en:`A sticky client: it stays on distant AP1 at -79 dBm instead of roaming to AP3`,hi:`Sticky client: yeh AP3 par roam karne ke bajaye door ke AP1 par -79 dBm par ruka hai`}],a:3,w:{en:`The client decides when to roam, and this one never left AP1 even though AP3 is heard at about -50 dBm on 5 GHz. At -79 dBm it uses low rates and retries. Reconnecting fixes it now; long-term, tune the driver's roaming, balance AP power and enable 802.11k/v. The client has an IP and is authenticated, so VLAN and PSK are fine.`,hi:`Roam karne ka faisla client karta hai, aur yeh AP1 se kabhi nahi hata jabki AP3 5 GHz par lagbhag -50 dBm par sunai deta hai. -79 dBm par yeh low rates aur retries use karta hai. Reconnect karna abhi theek karta hai; long-term, driver ki roaming tune karo, AP power balance karo aur 802.11k/v enable karo. Client ke paas IP hai aur authenticated hai, isliye VLAN aur PSK theek hain.`}},{title:{en:`Old phones cannot find the SSID`,hi:`Purane phones ko SSID nahi milta`},ticket:{en:`After a "tuning" change, laptops still join NK-STAFF, but the older handheld phones (2.4 GHz only, like PHONE1) no longer list the SSID at all.`,hi:`Ek "tuning" change ke baad laptops abhi bhi NK-STAFF join karte hain, par purane handheld phones (sirf 2.4 GHz, jaise PHONE1) ab SSID list hi nahi karte.`},out:`(WLC1) >show wlan 1

WLAN Identifier.................................. 1
Profile Name..................................... STAFF
Network Name (SSID).............................. NK-STAFF
Status........................................... Enabled
Broadcast SSID................................... Enabled
Number of Active Clients......................... 3
Interface........................................ staff
Radio Policy..................................... 802.11a only
Maximum Clients Allowed.......................... Unlimited`,q:{en:`What should you change?`,hi:`Aapko kya badalna chahiye?`},o:[{en:`Enable SSID broadcast`,hi:`SSID broadcast enable karo`},{en:`Set the WLAN radio policy back to All so 2.4 GHz radios advertise it`,hi:`WLAN radio policy wapas All karo taaki 2.4 GHz radios ise advertise karein`},{en:`Move the phones to channel 36`,hi:`Phones ko channel 36 par le jaao`},{en:`Change the phones' PSK`,hi:`Phones ka PSK badlo`}],a:1,w:{en:`With the radio policy set to 802.11a only, the WLAN is advertised only on 5 GHz radios. 2.4 GHz-only phones never hear its beacons. Broadcast is already enabled, a client cannot use channel 36 without a 5 GHz radio, and a PSK problem would show an authentication failure, not a missing SSID.`,hi:`Radio policy 802.11a only hone se WLAN sirf 5 GHz radios par advertise hota hai. Sirf 2.4 GHz wale phones iske beacons kabhi nahi sunte. Broadcast pehle se enabled hai, bina 5 GHz radio ke client channel 36 use nahi kar sakta, aur PSK problem authentication failure dikhati, gayab SSID nahi.`}}];export{e as default};