var e=[{title:{en:`Marked correctly, served as best-effort`,hi:`Sahi marked, best-effort ki tarah serve`},ticket:{en:`BR1 classifies softphone RTP as EF and rewrites DSCP 46 on the WAN. The call quality at CORE1 is still poor. Read the CORE1 output taken during a test call.`,hi:`BR1 softphone RTP ko EF classify karta hai aur WAN par DSCP 46 rewrite karta hai. CORE1 par call quality phir bhi kharab hai. Test call ke dauran CORE1 ka output padho.`},out:`lab@CORE1> show class-of-service interface ge-0/0/0
Physical interface: ge-0/0/0, Index: 158
Maximum usable queues: 8, Queues in use: 2
  Scheduler map: default, Index: 2
  Congestion-notification: Disabled

  Logical interface: ge-0/0/0.0, Index: 490
    Object                  Name                   Type                    Index
    Classifier              ipprec-compatibility   ip                      13

lab@CORE1> show interfaces queue ge-0/0/1
Queue: 0, Forwarding classes: best-effort
  Queued:
    Packets              :                   400                    32 pps
Queue: 1, Forwarding classes: expedited-forwarding
  Queued:
    Packets              :                     0                     0 pps`,q:{en:`What is the cause?`,hi:`Wajah kya hai?`},o:[{en:`The rewrite rule on BR1 writes the wrong DSCP`,hi:`BR1 ka rewrite rule galat DSCP likhta hai`},{en:`CORE1 has no BA classifier on ge-0/0/0.0, so EF falls into best-effort`,hi:`CORE1 ke ge-0/0/0.0 par BA classifier nahi hai, isliye EF best-effort mein girta hai`},{en:`The scheduler-map on CORE1 is missing strict-high`,hi:`CORE1 ke scheduler-map mein strict-high nahi hai`},{en:`The policer on CORE1 drops EF`,hi:`CORE1 ka policer EF girata hai`}],a:1,w:{en:`The unit uses ipprec-compatibility, which maps only precedence 6 and 7 to network-control and everything else to best-effort. Bind a dscp classifier that maps ef to expedited-forwarding.`,hi:`Unit ipprec-compatibility use karta hai jo sirf precedence 6 aur 7 ko network-control aur baaki sab ko best-effort par map karta hai. Aisa dscp classifier bind karo jo ef ko expedited-forwarding par map kare.`}},{title:{en:`The phone works, the PC next to it does not`,hi:`Phone chalta hai, uske bagal ka PC nahi`},ticket:{en:`After filter VOICE-IN was applied as input on the voice LAN port of BR1, softphone calls work but nothing else from that subnet reaches the core. The filter configuration is shown.`,hi:`BR1 ke voice LAN port par filter VOICE-IN input lagane ke baad softphone calls chalti hain lekin us subnet ka aur kuch core tak nahi pahunchta. Filter configuration dikhayi gayi hai.`},out:`lab@BR1> show configuration firewall
family inet {
    filter VOICE-IN {
        term rtp {
            from {
                source-address 10.50.10.0/24;
                destination-port 16384-32767;
                protocol udp;
            }
            then {
                accept;
                forwarding-class expedited-forwarding;
                loss-priority low;
            }
        }
    }
}

SOFTPH> ping 10.60.1.10
10.60.1.10 icmp_seq=1 timeout
10.60.1.10 icmp_seq=2 timeout`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`A rewrite rule on ge-0/0/1`,hi:`ge-0/0/1 par rewrite rule`},{en:`A scheduler-map on the WAN port`,hi:`WAN port par scheduler-map`},{en:`A final term that accepts all other traffic`,hi:`Ek aakhri term jo baaki saara traffic accept kare`},{en:`A BA classifier on the LAN port`,hi:`LAN port par BA classifier`}],a:2,w:{en:`Every Junos filter ends with an implicit discard. Without a catch-all accept term, all traffic that does not match term rtp (ICMP here) is dropped.`,hi:`Har Junos filter ke end mein implicit discard hota hai. Catch-all accept term ke bina jo traffic term rtp se match nahi karta (yahan ICMP) woh drop ho jaata hai.`}},{title:{en:`Is the guest cap working and is staff safe?`,hi:`Guest cap chal raha hai aur staff safe hai?`},ticket:{en:`The Indore hub applied filter GUEST-LIMIT. Each of GUEST and STAFF sent a 6 Mbps UDP stream for 10 seconds. Read the results.`,hi:`Indore hub ne filter GUEST-LIMIT lagaya. GUEST aur STAFF ne har ek ne 10 second ke liye 6 Mbps UDP stream bheji. Nateeje padho.`},out:`GUEST> traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   203.0.113.80       udp/8443   0     6000     10/10 37500     12650      66.3%

STAFF> traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   203.0.113.80       udp/8443   0     6000     10/10 37500     37500      0.0%

lab@HUB> show firewall filter GUEST-LIMIT
Filter: GUEST-LIMIT
Counters:
Name                                                Bytes              Packets
guest-pkts                                        7500000                37500
Policers:
Name                                                Bytes              Packets
P-GUEST-guests                                    4970000                24850`,q:{en:`Why did STAFF lose nothing?`,hi:`STAFF ka kuch loss kyun nahi hua?`},o:[{en:`Staff traffic has a higher DSCP`,hi:`Staff traffic ka DSCP zyada hai`},{en:`The policer only polices outbound traffic`,hi:`Policer sirf outbound traffic police karta hai`},{en:`Staff packets are smaller`,hi:`Staff packets chhote hain`},{en:`Staff traffic does not match term guests, so the policer never sees it`,hi:`Staff traffic term guests se match nahi karta, isliye policer use dekhta hi nahi`}],a:3,w:{en:`The policer is attached inside term guests (source 10.77.20.0/24). The staff subnet falls to term others and is accepted without policing. The guest stream got about one third through, matching the 2 Mbps limit.`,hi:`Policer term guests (source 10.77.20.0/24) ke andar laga hai. Staff subnet term others par girta hai aur bina policing ke accept hota hai. Guest stream ka lagbhag ek tihai nikla, jo 2 Mbps limit se match karta hai.`}},{title:{en:`Voice loses 90 percent under backup`,hi:`Backup mein voice ka 90 percent loss`},ticket:{en:`On EDGE (shaped to 2 Mbps) a 400 kbps EF call and a 3 Mbps backup run together. Read the outputs.`,hi:`EDGE par (2 Mbps par shaped) 400 kbps ki EF call aur 3 Mbps ka backup ek saath chalte hain. Outputs padho.`},out:`VOIPPC> traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.99.0.10         udp/30000  46    400      10/10 2500      250        90.0%

lab@EDGE> show class-of-service interface ge-0/0/0
Physical interface: ge-0/0/0, Index: 158
Maximum usable queues: 8, Queues in use: 2
  Shaping rate: 2000000 bps
  Scheduler map: default, Index: 2
  Congestion-notification: Disabled

lab@EDGE> show interfaces queue ge-0/0/0
Queue: 1, Forwarding classes: expedited-forwarding
  Queued:
    Packets              :                  2500                    50 pps
  Transmitted:
    Packets              :                   250                     0 pps
    Tail-dropped packets :                  2241                    50 pps`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Apply a scheduler-map that gives expedited-forwarding a strict-high scheduler`,hi:`Aisa scheduler-map lagao jo expedited-forwarding ko strict-high scheduler de`},{en:`Change the phones to DSCP 0`,hi:`Phones ko DSCP 0 par karo`},{en:`Remove the shaping rate`,hi:`Shaping rate hata do`},{en:`Add a rewrite rule on the LAN port`,hi:`LAN port par rewrite rule lagao`}],a:0,w:{en:`Classification works (queue 1 receives the call) but the default scheduler map gives expedited-forwarding nothing. A scheduler-map with a strict-high voice scheduler served the call with 0 percent loss in the lab.`,hi:`Classification chal rahi hai (queue 1 ko call mil rahi hai) lekin default scheduler map expedited-forwarding ko kuch nahi deta. Strict-high voice scheduler wale scheduler-map ne lab mein call ko 0 percent loss ke saath serve kiya.`}},{title:{en:`Commit refused`,hi:`Commit refuse hua`},ticket:{en:`An engineer builds scheduler-map SM-Y and runs commit check. Read the result.`,hi:`Ek engineer scheduler-map SM-Y banata hai aur commit check chalata hai. Result padho.`},out:`[edit]
lab@EDGE# commit check
[edit class-of-service scheduler-maps SM-Y]
  'forwarding-class best-effort'
    Referenced scheduler 'NOPE' is not defined
error: configuration check-out failed`,q:{en:`How do you resolve it?`,hi:`Ise kaise hal karoge?`},o:[{en:`Reboot the router and commit again`,hi:`Router reboot karke dobara commit karo`},{en:`Use commit force`,hi:`commit force use karo`},{en:`Point the forwarding class at a scheduler that exists (or define NOPE), then commit`,hi:`Forwarding class ko aise scheduler par point karo jo maujood ho (ya NOPE define karo), phir commit karo`},{en:`Apply the map to a logical unit instead`,hi:`Map ko logical unit par lagao`}],a:2,w:{en:`The scheduler-map references a scheduler name that is not configured. Correct the name or create the scheduler; Junos will not commit a dangling reference.`,hi:`Scheduler-map aise scheduler naam ko refer karta hai jo configured nahi hai. Naam theek karo ya scheduler banao; Junos dangling reference commit nahi karta.`}},{title:{en:`Zero loss but the policer counts packets`,hi:`Zero loss lekin policer packets gin raha hai`},ticket:{en:`A policer was changed to then loss-priority high and attached to the unit. The same 6 Mbps stream was sent for 10 seconds. A colleague says the policer is broken because there is no loss.`,hi:`Policer ko then loss-priority high kiya gaya aur unit par lagaya gaya. Wahi 6 Mbps stream 10 second ke liye bheji gayi. Ek colleague kehta hai policer kharab hai kyunki loss nahi hai.`},out:`GUEST> traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   203.0.113.80       udp/8443   0     6000     10/10 37500     37500      0.0%

lab@HUB> show policer
Policers:
Name                                                Bytes              Packets
__default_arp_policer__                                 0                    0
P-GUEST-ge-0/0/1.0-inet-i                         4970000                24850`,q:{en:`What is the correct interpretation?`,hi:`Sahi interpretation kya hai?`},o:[{en:`The policer is broken and counts random packets`,hi:`Policer kharab hai aur random packets ginta hai`},{en:`It is a soft policer: 24,850 packets were out of profile and marked high loss priority, not dropped`,hi:`Yeh soft policer hai: 24,850 packets out of profile the aur high loss priority se mark hue, drop nahi hue`},{en:`The burst size is too large for any counting`,hi:`Burst size itna bada hai ki counting hi nahi hoti`},{en:`The counter shows packets dropped by the scheduler`,hi:`Counter scheduler ke dropped packets dikhata hai`}],a:1,w:{en:`then loss-priority high marks the excess instead of discarding it. The counter shows how many were out of profile; a drop profile would decide later whether they die. The instance name shows it is attached to the whole unit.`,hi:`then loss-priority high excess ko discard ki jagah mark karta hai. Counter batata hai kitne out of profile the; baad mein drop profile tay karta hai ki woh marenge ya nahi. Instance naam batata hai ki yeh poori unit par laga hai.`}},{title:{en:`Reading a drop profile`,hi:`Drop profile padhna`},ticket:{en:`Drop profile DP-HIGH is attached to the best-effort scheduler for high loss priority. Read the profile and answer for a queue that is 45 percent full (linear interpolation between the points).`,hi:`Drop profile DP-HIGH high loss priority ke liye best-effort scheduler se juda hai. Profile padho aur 45 percent bhari queue ke liye jawab do (points ke beech linear interpolation).`},out:`lab@EDGE> show class-of-service drop-profile
Drop profile: default-drop-profile, Type: discrete, Index: 1
  Fill level    Drop probability
         100                 100
Drop profile: DP-HIGH, Type: interpolated, Index: 33432
  Fill level    Drop probability
          30                  20
          60                 100`,q:{en:`About what drop probability applies to a high-loss-priority packet at 45 percent fill?`,hi:`45 percent fill par high-loss-priority packet par lagbhag kitni drop probability lagti hai?`},o:[{en:`About 60 percent`,hi:`Lagbhag 60 percent`},{en:`20 percent`,hi:`20 percent`},{en:`100 percent`,hi:`100 percent`},{en:`0 percent, because the default profile applies`,hi:`0 percent, kyunki default profile lagta hai`}],a:0,w:{en:`Between 30 percent fill (20 percent) and 60 percent fill (100 percent) the line rises 80 points over 30 points of fill. At 45 percent that is 20 + 0.5 x 80 = 60 percent. Low-priority packets would still use the default profile.`,hi:`30 percent fill (20 percent) aur 60 percent fill (100 percent) ke beech line 30 points fill mein 80 points badhti hai. 45 percent par yeh 20 + 0.5 x 80 = 60 percent hai. Low-priority packets abhi bhi default profile use karenge.`}}];export{e as default};