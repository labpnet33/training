var e=[{title:{en:`Two Active gateways in Hyderabad`,hi:`Hyderabad mein do Active gateways`},ticket:{en:`After a colleague "hardened" R2 in lab 1, users on 192.168.20.0/24 see random drops. You collect this output.`,hi:`Lab 1 mein ek colleague ne R2 ko "harden" kiya, uske baad 192.168.20.0/24 ke users ko random drops dikhte hain. Aap yeh output nikaalte ho.`},out:`R1#show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       1    110 P Active  local           unknown         192.168.20.1

R2#show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       1    100 P Active  local           unknown         192.168.20.1

R2#
%HSRP-4-BADAUTH: Bad authentication from 192.168.20.2, group 1, remote state Active

SW1#show mac address-table address 0000.0c9f.f001
%MAC move: 0000.0c9f.f001 flapping between Gi0/1 and Gi0/2`,q:{en:`What is the root cause?`,hi:`Root cause kya hai?`},o:[{en:`R2's priority is too low`,hi:`R2 ki priority bahut kam hai`},{en:`The HSRP MD5 key-string differs between R1 and R2`,hi:`R1 aur R2 ke beech HSRP MD5 key-string alag hai`},{en:`Preempt is missing on R2`,hi:`R2 par preempt missing hai`},{en:`The virtual IP is a real interface address`,hi:`Virtual IP asli interface address hai`}],a:1,w:{en:`BADAUTH means R2 rejects R1's hellos, so each router thinks it is alone and becomes Active; the switch sees the virtual MAC on two ports. Priority or preempt problems never create two Actives. Set the same key-string NK-HSRP on both.`,hi:`BADAUTH ka matlab R2 R1 ke hellos reject karta hai, to har router sochta hai woh akela hai aur Active ban jaata hai; switch virtual MAC ko do ports par dekhta hai. Priority ya preempt problems kabhi do Actives nahi banate. Dono par same key-string NK-HSRP set karo.`}},{title:{en:`ISP-A died but R1 kept the gateway`,hi:`ISP-A mar gaya lekin R1 ne gateway rakha`},ticket:{en:`ISP-A's upstream is down. The probe fails as expected, yet all users still go through R1 and cannot reach the internet.`,hi:`ISP-A ka upstream down hai. Probe ummeed ke mutabik fail hota hai, phir bhi saare users R1 se jaate hain aur internet tak nahi pahunch paate.`},out:`R1#show track 10
Track 10
  IP SLA 1 reachability
  Reachability is Down
    1 change, last change 00:02:41
  Tracked by:
    HSRP GigabitEthernet0/0 1

R1#show standby
GigabitEthernet0/0 - Group 1 (version 2)
  State is Active
  Preemption enabled
  Priority 105 (configured 110)
    Track object 10 state Down decrement 5

R2#show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       1    100 P Standby 192.168.20.2    local           192.168.20.1`,q:{en:`Why has R2 not taken over?`,hi:`R2 ne kaam kyun nahi liya?`},o:[{en:`IP SLA is not scheduled`,hi:`IP SLA schedule nahi hai`},{en:`R2 has no preempt configured`,hi:`R2 par preempt configured nahi hai`},{en:`HSRP is not linked to track 10`,hi:`HSRP track 10 se juda nahi hai`},{en:`The decrement of 5 leaves R1 at 105, still above R2's 100`,hi:`Decrement 5 R1 ko 105 par chhodta hai, jo R2 ke 100 se abhi bhi upar hai`}],a:3,w:{en:`The track is Down and HSRP follows it (Tracked by, Track object 10 state Down), and R2 shows P. The arithmetic fails: 110 - 5 = 105 > 100. Use standby 1 track 10 decrement 20 so R1 drops to 90.`,hi:`Track Down hai aur HSRP use follow karta hai (Tracked by, Track object 10 state Down), aur R2 P dikhata hai. Hisaab fail hota hai: 110 - 5 = 105 > 100. standby 1 track 10 decrement 20 use karo taaki R1 90 par gire.`}},{title:{en:`BR2 will not synchronise`,hi:`BR2 sync nahi hota`},ticket:{en:`In lab 3, BR1 is synchronised to HQ at stratum 4. BR2 has the same commands but stays unsynchronised. Ping from BR2 to 10.255.0.1 succeeds.`,hi:`Lab 3 mein BR1 HQ se stratum 4 par synced hai. BR2 par same commands hain lekin woh unsynchronised rehta hai. BR2 se 10.255.0.1 tak ping chalta hai.`},out:`BR2#show ntp associations detail
10.255.0.1 configured, ipv4, insane, invalid, unsynced, stratum 16
our mode client, peer mode unspec, our poll intvl 64, peer poll intvl 1024
root delay 0.00 msec, root disp 0.00, reach 0, sync dist 16000.00

BR2#show running-config | include ntp
ntp authentication-key 1 md5 0822455D0A16 7
ntp authenticate
ntp trusted-key 1
ntp server 10.255.0.1 key 1

BR2#show ntp status
Clock is unsynchronized, stratum 16, no reference clock`,q:{en:`What is the most likely cause and fix?`,hi:`Sabse sambhav cause aur fix kya hai?`},o:[{en:`The key secret differs from HQ's (case-sensitive); re-enter ntp authentication-key 1 md5 NK-Time`,hi:`Key secret HQ wale se alag hai (case-sensitive); ntp authentication-key 1 md5 NK-Time dobara daalo`},{en:`ntp trusted-key 1 is missing`,hi:`ntp trusted-key 1 missing hai`},{en:`HQ needs ntp authenticate`,hi:`HQ ko ntp authenticate chahiye`},{en:`Remove ntp authenticate so it syncs`,hi:`Sync ke liye ntp authenticate hata do`}],a:0,w:{en:`All four client lines are present and the path works, so the secret is the suspect; type 7 hides it. HQ does not need ntp authenticate, and removing authentication would violate the audit requirement.`,hi:`Chaaron client lines maujood hain aur path chalta hai, to secret suspect hai; type 7 use chhupa deta hai. HQ ko ntp authenticate nahi chahiye, aur authentication hatana audit requirement todega.`}},{title:{en:`R2 stays Master after the test`,hi:`Test ke baad R2 Master bana rehta hai`},ticket:{en:`In lab 2 you shut and re-enabled R1 Gi0/0. R1 is back up with priority 120, but R2 is still Master ten minutes later.`,hi:`Lab 2 mein aapne R1 Gi0/0 shut karke phir enable kiya. R1 priority 120 ke saath wapas up hai, lekin das minute baad bhi R2 Master hai.`},out:`R1#show vrrp brief
Interface          Grp Pri Time  Own Pre State   Master addr     Group addr
Gi0/0              5   120 3531           Backup  192.168.30.3    192.168.30.254

R2#show vrrp brief
Interface          Grp Pri Time  Own Pre State   Master addr     Group addr
Gi0/0              5   100 3609       Y  Master  192.168.30.3    192.168.30.254

R1#show running-config interface GigabitEthernet0/0 | include vrrp
 vrrp 5 ip 192.168.30.254
 vrrp 5 priority 120
 no vrrp 5 preempt
 vrrp 5 authentication text NKvrrp5`,q:{en:`Why does R1 not become Master again?`,hi:`R1 dobara Master kyun nahi banta?`},o:[{en:`VRRP never preempts`,hi:`VRRP kabhi preempt nahi karta`},{en:`The authentication keys differ`,hi:`Authentication keys alag hain`},{en:`Preemption was disabled on R1 with no vrrp 5 preempt`,hi:`R1 par no vrrp 5 preempt se preemption disable kiya gaya`},{en:`R2 is the address owner`,hi:`R2 address owner hai`}],a:2,w:{en:`VRRP preempts by default, but R1's Pre column is empty and the config shows no vrrp 5 preempt. Keys match (R1 is Backup, not a second Master) and R2 is not the owner (priority 100, not 255). Remove the line.`,hi:`VRRP default mein preempt karta hai, lekin R1 ka Pre column khaali hai aur config no vrrp 5 preempt dikhata hai. Keys match karti hain (R1 Backup hai, doosra Master nahi) aur R2 owner nahi (priority 100, 255 nahi). Line hatao.`}},{title:{en:`Web works only without the new ACL`,hi:`Web sirf naye ACL ke bina chalta hai`},ticket:{en:`Security asked to allow only PC1 to the internet. An ACL was applied outbound on R1's outside interface, and now PC1 cannot browse either.`,hi:`Security ne sirf PC1 ko internet allow karne ko kaha. R1 ke outside interface par outbound ACL lagaya gaya, aur ab PC1 bhi browse nahi kar paata.`},out:`R1#show ip access-lists 120
Extended IP access list 120
    10 permit ip host 192.168.20.10 any
    20 deny ip any any (412 matches)

R1#show running-config | include nat|access-group
ip nat inside source list 10 interface GigabitEthernet0/1 overload
 ip access-group 120 out

R1#show ip nat translations
Pro Inside global         Inside local          Outside local         Outside global
tcp 203.0.113.2:1031      192.168.20.10:51022   198.51.100.10:443     198.51.100.10:443`,q:{en:`Why is PC1's traffic dropped?`,hi:`PC1 ka traffic drop kyun hota hai?`},o:[{en:`NAT is not creating translations`,hi:`NAT translations nahi bana raha`},{en:`The outbound ACL on the outside interface sees the translated source 203.0.113.2, not 192.168.20.10`,hi:`Outside interface par outbound ACL translated source 203.0.113.2 dekhta hai, 192.168.20.10 nahi`},{en:`The ISP has no route back`,hi:`ISP ke paas wapas ka route nahi`},{en:`The NAT ACL 10 does not include PC1`,hi:`NAT ACL 10 mein PC1 shamil nahi`}],a:1,w:{en:`The translation exists, so NAT works. Inside to outside, NAT happens before the outbound ACL, which therefore sees 203.0.113.2 and hits deny. Apply the ACL inbound on the inside interface, where 192.168.20.10 is still visible.`,hi:`Translation maujood hai, to NAT chalta hai. Inside se outside mein NAT outbound ACL se pehle hota hai, isliye ACL 203.0.113.2 dekhta hai aur deny se takrata hai. ACL ko inside interface par inbound lagao, jahan 192.168.20.10 abhi bhi dikhta hai.`}},{title:{en:`HQ lost time after hardening`,hi:`Hardening ke baad HQ ka time gaya`},ticket:{en:`In production, HQ synchronises to external server 192.0.2.123 and serves the branches. After an engineer added an NTP access group for the branches, HQ and every branch drifted.`,hi:`Production mein HQ external server 192.0.2.123 se sync hota hai aur branches ko serve karta hai. Engineer ne branches ke liye NTP access group joda, uske baad HQ aur har branch drift hui.`},out:`HQ#show running-config | include ntp|access-list 20
access-list 20 permit 10.0.0.0 0.0.255.255
ntp access-group serve-only 20
ntp server 192.0.2.123

HQ#show ntp associations
  address         ref clock       st   when   poll reach  delay  offset   disp
 ~192.0.2.123     .INIT.          16      -   1024     0  0.000   0.000 15937.
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured

HQ#show ntp status
Clock is unsynchronized, stratum 16, no reference clock`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Permit 192.0.2.123 in ntp access-group peer, because unmatched sources are denied once any group exists`,hi:`192.0.2.123 ko ntp access-group peer mein permit karo, kyunki koi group exist karte hi unmatched sources deny hote hain`},{en:`Change serve-only to query-only`,hi:`serve-only ko query-only mein badlo`},{en:`Add ntp master 3 on HQ`,hi:`HQ par ntp master 3 jodo`},{en:`Add ntp authenticate on HQ`,hi:`HQ par ntp authenticate jodo`}],a:0,w:{en:`The upstream server matches no group, so its replies are denied and HQ falls to stratum 16; branches cannot sync to an unsynchronised server. Add access-list 10 permit 192.0.2.123 and ntp access-group peer 10. ntp master would hide the problem with an unsynchronised free-running clock.`,hi:`Upstream server kisi group se match nahi karta, to uske replies deny hote hain aur HQ stratum 16 par gir jaata hai; branches unsynchronised server se sync nahi ho sakti. access-list 10 permit 192.0.2.123 aur ntp access-group peer 10 jodo. ntp master free-running clock se problem chhupa dega.`}},{title:{en:`Half-finished VRRP migration`,hi:`Aadhi adhoori VRRP migration`},ticket:{en:`Tonight's change moved R1 to the VRRPv3 command set. R2 will be changed next week. Since the change, users complain of drops.`,hi:`Aaj raat ke change ne R1 ko VRRPv3 command set par move kiya. R2 agle hafte badlega. Change ke baad se users drops ki shikayat kar rahe hain.`},out:`R1#show running-config | section vrrp|fhrp
fhrp version vrrp v3
interface GigabitEthernet0/0
 vrrp 5 address-family ipv4
  address 192.168.30.254 primary
  priority 120

R1#show vrrp brief
  Interface          Grp  A-F Pri  Time Own Pre State   Master addr/Group addr
  Gi0/0                5 IPv4 120     0  N   Y  MASTER  192.168.30.2(local) 192.168.30.254

R2#show vrrp brief
Interface          Grp Pri Time  Own Pre State   Master addr     Group addr
Gi0/0              5   100 3609       Y  Master  192.168.30.3    192.168.30.254`,q:{en:`What single change restores one Master tonight?`,hi:`Kaunsa ek change aaj raat ek Master wapas laata hai?`},o:[{en:`Lower R2's priority to 90`,hi:`R2 ki priority 90 karo`},{en:`Remove authentication from R2`,hi:`R2 se authentication hatao`},{en:`Change the VRID on R1 to 6`,hi:`R1 par VRID 6 karo`},{en:`Add vrrpv2 under R1's vrrp 5 address-family ipv4 so R1 also speaks VRRPv2`,hi:`R1 ke vrrp 5 address-family ipv4 ke under vrrpv2 jodo taaki R1 VRRPv2 bhi bole`}],a:3,w:{en:`R1 sends v3 adverts that R2 (classic v2) does not understand, so both are Master. The vrrpv2 compatibility command makes R1's IPv4 group interoperate with v2 peers. Priority changes cannot help routers that do not hear each other; a different VRID creates a second virtual router.`,hi:`R1 v3 adverts bhejta hai jo R2 (classic v2) nahi samajhta, to dono Master hain. vrrpv2 compatibility command R1 ke IPv4 group ko v2 peers ke saath interoperate karwata hai. Jo routers ek doosre ko sun nahi rahe unki madad priority changes nahi kar sakte; alag VRID doosra virtual router banata hai.`}},{title:{en:`Sixteen users, then nothing`,hi:`Solah users, phir kuch nahi`},ticket:{en:`A branch moved from PAT to a dynamic pool for logging reasons. Every morning the first users work, later arrivals cannot reach anything outside.`,hi:`Ek branch ne logging ki wajah se PAT se dynamic pool par move kiya. Har subah pehle users chalte hain, baad mein aane wale bahar kuch bhi reach nahi kar paate.`},out:`BR#show running-config | include ip nat
ip nat pool BR-POOL 203.0.113.16 203.0.113.30 prefix-length 28
ip nat inside source list 10 pool BR-POOL

BR#show ip nat statistics
Total active translations: 15 (0 static, 15 dynamic; 0 extended)
Hits: 30412  Misses: 214
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 10 pool BR-POOL refcount 15
 pool BR-POOL: id 1, netmask 255.255.255.240
        start 203.0.113.16 end 203.0.113.30
        type generic, total addresses 15, allocated 15 (100%), misses 214`,q:{en:`What explains the symptom?`,hi:`Symptom ko kya explain karta hai?`},o:[{en:`The ACL does not match late users`,hi:`ACL late users ko match nahi karta`},{en:`The ISP does not route the pool`,hi:`ISP pool route nahi karta`},{en:`One-to-one dynamic NAT: the 15 addresses are all allocated, so new hosts miss; add overload`,hi:`One-to-one dynamic NAT: 15 addresses sab allocate ho chuke, to naye hosts miss karte hain; overload jodo`},{en:`Translations never time out because of static entries`,hi:`Static entries ki wajah se translations kabhi time out nahi hoti`}],a:2,w:{en:`allocated 15 (100%) and rising misses show pool exhaustion. Without overload each inside host holds one global address for up to 24 hours. Adding overload to the rule lets all hosts share the pool with unique ports while keeping the pool for logging.`,hi:`allocated 15 (100%) aur badhte misses pool exhaustion dikhate hain. Overload ke bina har inside host 24 ghante tak ek global address pakde rehta hai. Rule mein overload jodne se saare hosts unique ports ke saath pool share karte hain aur logging ke liye pool bhi rehta hai.`}}];export{e as default};