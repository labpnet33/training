var e={id:`omp-tlocs`,h:{en:`Layer 3: OMP routes, TLOCs and the route that never arrives`,hi:`Layer 3: OMP routes, TLOCs aur woh route jo kabhi nahi aata`},body:{en:`
<p>Think of a postal system. A branch writes its address on a letter (a route) and hands it to the central post office (the Controller). The post office decides who may read it and passes copies to other branches. If a branch complains "I never get Delhi's address", there are only a few places the letter can be lost: the sender never wrote it, the post office never received it, the post office decided not to forward it, or the receiver got it but cannot use it. OMP troubleshooting is simply finding which of the four.</p>

<h3>The life of a route, with the counters</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Route path with counters">
<rect x="10" y="60" width="120" height="70" rx="8" fill="#bbf7d0"/><text x="70" y="88" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1</text><text x="70" y="106" text-anchor="middle" class="svg-muted" font-size="11">routes-sent</text>
<rect x="260" y="60" width="120" height="70" rx="8" fill="#bae6fd"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">VSMART</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="11">received / sent</text>
<rect x="510" y="60" width="120" height="70" rx="8" fill="#bbf7d0"/><text x="570" y="88" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1</text><text x="570" y="106" text-anchor="middle" class="svg-muted" font-size="11">received, installed</text>
<line x1="130" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/><line x1="380" y1="95" x2="510" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="195" y="82" text-anchor="middle" class="svg-accent" font-size="12">1 advertised?</text><text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">2 received?  3 policy lets it pass?</text><text x="445" y="82" text-anchor="middle" class="svg-accent" font-size="12">4 installed?</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Check the counter at each stage; the first stage where it stops is the fault</text>
</svg><p class="cap">Four stages, four counters. The first stage where the number stops is where to look.</p></div>

<h3>Stage by stage</h3>
<h4>Stage 0: is OMP itself up?</h4>
<pre class="out">E-DEL-1# show sdwan omp summary
oper-state               UP
admin-state              UP
personality              vedge
routes-received          6
routes-installed         6
routes-sent              1
tlocs-received           4
tlocs-installed          4
tlocs-sent               2

E-DEL-1# show sdwan omp peers</pre>
<p>If <code>oper-state</code> is not UP, OMP has no session with the Controller; go back to chapter 2, because OMP rides on the control connection. <code>show sdwan omp peers</code> lists the Controller as the peer and its state.</p>

<h4>Stage 1: did the sender advertise it?</h4>
<p>Look at <code>routes-sent</code> on the originating edge. A prefix is advertised only if it is in the service VPN's table <b>and</b> OMP is told to advertise that source: connected, static, or a routing protocol such as OSPF or BGP. A common fault is a LAN prefix learned by OSPF that nobody redistributed into OMP. In the Manager this is the "advertise OMP" setting in the VPN feature; on the device it appears in the OMP configuration.</p>

<h4>Stages 2 and 3: did the Controller receive and forward it?</h4>
<pre class="out">VSMART# show omp peers
                          DOMAIN OVERLAY SITE
PEER          TYPE   ID     ID      ID    STATE UPTIME         R/I/S
-----------------------------------------------------------------------
10.255.0.11   vedge  1      1       100   up    3:12:44:09     1/1/6
10.255.0.12   vedge  1      1       200   up    3:12:43:50     1/1/6
10.255.0.13   vedge  1      1       300   up    0:00:51:02     <span class="hl">1/1/0</span></pre>
<p>The column <b>R/I/S</b> means routes received, installed and sent for that peer. Here the Controller has received E-BLR-1's prefix (R=1) and installed it, but has sent <b>0</b> routes to E-BLR-1: the branch advertises its LAN but does not get anyone else's. When R is 0 for a peer, the problem is stage 1; when R is fine and S is 0 or low, something on the Controller is filtering, which is almost always a <b>centralized control policy</b> (see the sdw-ctl-policy module): a topology or route policy applied to the wrong site list, or applied in the wrong direction. Check on the Controller:</p>
<pre class="code">VSMART# show running-config policy
VSMART# show running-config apply-policy
VSMART# show omp routes vpn 10</pre>
<p>Look for a <code>site-list</code> that contains the branch and an <code>apply-policy</code> with <code>control-policy ... out</code> or <code>in</code>; remember that a policy applies to a site list in one direction, and an unmatched route is implicitly rejected when the policy has a default of reject.</p>

<h4>Stage 4: the receiver got it but cannot use it</h4>
<pre class="out">E-DEL-1# show sdwan omp routes vpn 10
Code:
C   -> chosen
I   -> installed
Red -> redistributed
Rej -> rejected
L   -> looped
R   -> resolved
S   -> stale
Ext -> extranet
Inv -> invalid
Stg -> staged
U   -> TLOC Unresolved

VPN PREFIX        FROM PEER    ID  LABEL STATUS   TYPE      TLOC IP      COLOR        ENCAP
10  10.2.10.0/24  10.255.255.2 1   1012  C,I,R    installed 10.255.0.12  biz-internet ipsec
10  10.3.10.0/24  10.255.255.2 1   1012  <span class="hl">Inv,U</span>    installed 10.255.0.13  biz-internet ipsec</pre>
<p>The status letters are your clue. <b>C,I,R</b> is the healthy state: chosen, installed, resolved. <b>Inv,U</b> means the route is invalid because its <b>TLOC is unresolved</b>: the route points at 10.255.0.13 over biz-internet, but this edge has no usable way to that TLOC. Check <code>show sdwan omp tlocs</code> for that TLOC; if the TLOC is missing the remote side is not advertising it (tunnel interface down, wrong colour, or a TLOC filtered by policy). If the TLOC is present, check <code>show sdwan bfd sessions</code>: the route cannot resolve without a working tunnel (next chapter). Other letters: <b>Rej</b> rejected by a policy, <b>L</b> looped, <b>S</b> stale (the Controller is holding old information during a graceful restart).</p>

<h4>The route is installed but the wrong one wins</h4>
<p>OMP routes enter the routing table with administrative distance 251, much higher than OSPF, BGP or static routes. If the same prefix is also learned by a lower-distance protocol, such as OSPF from the LAN, that route is used and the OMP route sits in the table as a backup. <code>show ip route vrf 10 10.3.10.0</code> shows which protocol is chosen.</p>

<table class="cmp"><tr><th>Symptom</th><th>Where the number stops</th><th>Likely cause</th></tr>
<tr><td>routes-sent is 0 on the origin</td><td>Stage 1</td><td>Prefix not in the VPN, or source not advertised into OMP</td></tr>
<tr><td>Controller R is 0 for that peer</td><td>Stage 1 to 2</td><td>OMP session issue or VPN mismatch</td></tr>
<tr><td>Controller R fine, S is 0 to others</td><td>Stage 3</td><td>Control policy: site list, direction, default reject</td></tr>
<tr><td>Receiver shows route as Inv,U</td><td>Stage 4</td><td>TLOC unresolved: TLOC not advertised or no BFD tunnel</td></tr>
<tr><td>Route installed, traffic goes elsewhere</td><td>After stage 4</td><td>Lower-distance route, data policy, AAR choice</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Delhi cannot reach 10.3.10.0/24 (Bengaluru). Stage 0: OMP UP. Stage 1: E-BLR-1 shows routes-sent 1. Stage 2: the Controller shows 1/1/0 for E-BLR-1, so R is fine. Stage 3: for E-DEL-1 the S counter is 6, so the Controller sends it. Stage 4: <code>show sdwan omp routes vpn 10</code> on E-DEL-1 shows 10.3.10.0/24 as Inv,U. The TLOC 10.255.0.13 biz-internet is unresolved. <code>show sdwan omp tlocs</code> shows no TLOC from 10.255.0.13: its tunnel interface was shut by a template change last night. Re-enabling the tunnel interface brings the TLOC, the BFD sessions and the route back. Five commands, one cause.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Looking only at the edge and never at the Controller counters. (2) Blaming policy when the TLOC is unresolved. (3) Forgetting that connected, static and OSPF prefixes must be advertised into OMP. (4) Ignoring administrative distance. (5) Reading routes of the wrong VPN.</p></div>

<div class="exam"><p><b>Exam trap.</b> Learn the status codes: C chosen, I installed, R resolved, Inv invalid, U TLOC unresolved, Rej rejected, S stale. An invalid and unresolved route means the TLOC or tunnel is the problem, not the route itself. OMP runs between each edge and the Controller; edges do not peer with each other.</p></div>

<div class="scn"><h4>Pune sees no one</h4><p>After a policy change, E-BLR-1 could reach nobody except Delhi. The Controller showed R/I/S of 1/1/1 for E-BLR-1, so it sent only one route. The new control policy had a site list called BRANCHES-WEST that did not include site 300, and a default action of reject. Adding site 300 to the list restored the other six routes.</p><p><b>Lesson:</b> compare routes received and sent on the Controller before touching the edge.</p></div>

<div class="iv"><p class="q">"A branch does not receive a remote LAN prefix. How do you find where it was lost?"</p><p>I follow the route through four stages with counters: is it advertised by the origin, did the Controller receive it, did the Controller send it or does a control policy filter it, and is it installed on the receiver, where the status letters show if it is invalid because the TLOC is unresolved. I use show sdwan omp summary and routes on the edge and show omp peers on the Controller, and I check the administrative distance if another protocol learns the same prefix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow the route in four stages: advertised, received, forwarded, installed.</li>
<li>show omp peers on the Controller gives routes received, installed and sent per edge.</li>
<li>Status C,I,R is healthy; Inv,U means the TLOC is unresolved.</li>
<li>Control policy on the Controller is the usual cause when received is fine but sent is low.</li>
<li>OMP routes have administrative distance 251.</li>
</ul></div>
`,hi:`
<p>Postal system socho. Branch ek letter par apna address likhti hai (route) aur use central post office (Controller) ko deti hai. Post office tay karta hai kaun padh sakta hai aur doosri branches ko copies deta hai. Agar koi branch shikayat kare "mujhe Delhi ka address kabhi nahi milta", to letter kuch hi jagah kho sakta hai: bhejne wale ne likha hi nahi, post office ko mila hi nahi, post office ne aage bhejne se mana kiya, ya paane wale ko mila lekin woh use use nahi kar sakta. OMP troubleshooting bas yeh dhoondhna hai ki chaar mein se kaunsa.</p>

<h3>Route ki zindagi, counters ke saath</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Route path with counters">
<rect x="10" y="60" width="120" height="70" rx="8" fill="#bbf7d0"/><text x="70" y="88" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1</text><text x="70" y="106" text-anchor="middle" class="svg-muted" font-size="11">routes-sent</text>
<rect x="260" y="60" width="120" height="70" rx="8" fill="#bae6fd"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">VSMART</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="11">received / sent</text>
<rect x="510" y="60" width="120" height="70" rx="8" fill="#bbf7d0"/><text x="570" y="88" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1</text><text x="570" y="106" text-anchor="middle" class="svg-muted" font-size="11">received, installed</text>
<line x1="130" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/><line x1="380" y1="95" x2="510" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="195" y="82" text-anchor="middle" class="svg-accent" font-size="12">1 advertise hua?</text><text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">2 mila?  3 policy jaane deti hai?</text><text x="445" y="82" text-anchor="middle" class="svg-accent" font-size="12">4 installed?</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Har stage ka counter dekho; jahan pehli baar ruke wahi fault hai</text>
</svg><p class="cap">Chaar stages, chaar counters. Jahan number pehli baar rukta hai wahan dekho.</p></div>

<h3>Stage dar stage</h3>
<h4>Stage 0: kya OMP khud up hai?</h4>
<pre class="out">E-DEL-1# show sdwan omp summary
oper-state               UP
admin-state              UP
personality              vedge
routes-received          6
routes-installed         6
routes-sent              1
tlocs-received           4
tlocs-installed          4
tlocs-sent               2

E-DEL-1# show sdwan omp peers</pre>
<p>Agar <code>oper-state</code> UP nahi hai to OMP ka Controller ke saath session nahi hai; chapter 2 par wapas jao, kyunki OMP control connection par chalta hai. <code>show sdwan omp peers</code> Controller ko peer ke roop mein aur uski state dikhata hai.</p>

<h4>Stage 1: kya sender ne advertise kiya?</h4>
<p>Originating edge par <code>routes-sent</code> dekho. Prefix tabhi advertise hota hai jab woh service VPN ki table mein ho <b>aur</b> OMP ko us source ko advertise karne ko kaha gaya ho: connected, static, ya OSPF ya BGP jaisa routing protocol. Aam fault hai OSPF se seekha LAN prefix jise kisi ne OMP mein redistribute nahi kiya. Manager mein yeh VPN feature ki "advertise OMP" setting hai; device par OMP configuration mein dikhta hai.</p>

<h4>Stages 2 aur 3: kya Controller ne receive kiya aur aage bheja?</h4>
<pre class="out">VSMART# show omp peers
                          DOMAIN OVERLAY SITE
PEER          TYPE   ID     ID      ID    STATE UPTIME         R/I/S
-----------------------------------------------------------------------
10.255.0.11   vedge  1      1       100   up    3:12:44:09     1/1/6
10.255.0.12   vedge  1      1       200   up    3:12:43:50     1/1/6
10.255.0.13   vedge  1      1       300   up    0:00:51:02     <span class="hl">1/1/0</span></pre>
<p>Column <b>R/I/S</b> matlab us peer ke liye routes received, installed aur sent. Yahan Controller ne E-BLR-1 ka prefix receive kiya (R=1) aur install kiya, lekin E-BLR-1 ko <b>0</b> routes bheje: branch apna LAN advertise karti hai lekin kisi aur ka nahi paati. Jab kisi peer ke liye R 0 ho to problem stage 1 hai; jab R theek ho aur S 0 ya kam ho, to Controller par kuch filter kar raha hai, jo lagbhag hamesha <b>centralized control policy</b> hoti hai (sdw-ctl-policy module dekho): galat site list par lagi topology ya route policy, ya galat direction mein. Controller par check karo:</p>
<pre class="code">VSMART# show running-config policy
VSMART# show running-config apply-policy
VSMART# show omp routes vpn 10</pre>
<p>Aisi <code>site-list</code> dekho jismein branch ho aur <code>control-policy ... out</code> ya <code>in</code> wala <code>apply-policy</code>; yaad rakho ki policy site list par ek direction mein lagti hai, aur jab policy ka default reject ho to unmatched route implicitly reject hota hai.</p>

<h4>Stage 4: receiver ko mila lekin use nahi kar sakta</h4>
<pre class="out">E-DEL-1# show sdwan omp routes vpn 10
Code:
C   -> chosen
I   -> installed
Red -> redistributed
Rej -> rejected
L   -> looped
R   -> resolved
S   -> stale
Ext -> extranet
Inv -> invalid
Stg -> staged
U   -> TLOC Unresolved

VPN PREFIX        FROM PEER    ID  LABEL STATUS   TYPE      TLOC IP      COLOR        ENCAP
10  10.2.10.0/24  10.255.255.2 1   1012  C,I,R    installed 10.255.0.12  biz-internet ipsec
10  10.3.10.0/24  10.255.255.2 1   1012  <span class="hl">Inv,U</span>    installed 10.255.0.13  biz-internet ipsec</pre>
<p>Status ke letters aapka clue hain. <b>C,I,R</b> healthy state hai: chosen, installed, resolved. <b>Inv,U</b> matlab route invalid hai kyunki uska <b>TLOC unresolved</b> hai: route 10.255.0.13 ki taraf biz-internet par ishara karta hai, lekin is edge ke paas us TLOC tak koi kaam karne wala raasta nahi. Us TLOC ke liye <code>show sdwan omp tlocs</code> dekho; TLOC gayab ho to remote side use advertise nahi kar raha (tunnel interface down, galat colour, ya policy ne TLOC filter kiya). TLOC maujood ho to <code>show sdwan bfd sessions</code> dekho: kaam karne wale tunnel ke bina route resolve nahi hota (agla chapter). Baaki letters: <b>Rej</b> policy ne reject kiya, <b>L</b> looped, <b>S</b> stale (Controller graceful restart ke dauran purani jaankari pakde hue hai).</p>

<h4>Route installed hai lekin galat jeet raha hai</h4>
<p>OMP routes routing table mein administrative distance 251 ke saath aate hain, jo OSPF, BGP ya static se bahut zyada hai. Agar wahi prefix kam-distance protocol se bhi seekha jaye, jaise LAN se OSPF, to wahi route use hota hai aur OMP route backup ke roop mein baitha rehta hai. <code>show ip route vrf 10 10.3.10.0</code> dikhata hai kaunsa protocol chuna gaya.</p>

<table class="cmp"><tr><th>Symptom</th><th>Number kahan rukta hai</th><th>Sambhavit wajah</th></tr>
<tr><td>Origin par routes-sent 0</td><td>Stage 1</td><td>Prefix VPN mein nahi, ya source OMP mein advertise nahi hua</td></tr>
<tr><td>Us peer ke liye Controller R 0</td><td>Stage 1 se 2</td><td>OMP session issue ya VPN mismatch</td></tr>
<tr><td>Controller R theek, doosron ko S 0</td><td>Stage 3</td><td>Control policy: site list, direction, default reject</td></tr>
<tr><td>Receiver route ko Inv,U dikhata hai</td><td>Stage 4</td><td>TLOC unresolved: TLOC advertise nahi ya BFD tunnel nahi</td></tr>
<tr><td>Route installed, traffic kahin aur jaata hai</td><td>Stage 4 ke baad</td><td>Kam-distance route, data policy, AAR ka choice</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Delhi 10.3.10.0/24 (Bengaluru) tak nahi pahunch pa raha. Stage 0: OMP UP. Stage 1: E-BLR-1 routes-sent 1 dikhata hai. Stage 2: Controller E-BLR-1 ke liye 1/1/0 dikhata hai, to R theek hai. Stage 3: E-DEL-1 ke liye S counter 6 hai, to Controller bhejta hai. Stage 4: E-DEL-1 par <code>show sdwan omp routes vpn 10</code> 10.3.10.0/24 ko Inv,U dikhata hai. TLOC 10.255.0.13 biz-internet unresolved hai. <code>show sdwan omp tlocs</code> 10.255.0.13 se koi TLOC nahi dikhata: kal raat template change ne uska tunnel interface shut kar diya tha. Tunnel interface dobara enable karne se TLOC, BFD sessions aur route wapas aa gaye. Paanch commands, ek wajah.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Sirf edge dekhna aur Controller counters kabhi nahi. (2) TLOC unresolved hone par policy ko doshi thehrana. (3) Yeh bhoolna ki connected, static aur OSPF prefixes OMP mein advertise karne padte hain. (4) Administrative distance ignore karna. (5) Galat VPN ke routes padhna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Status codes yaad rakho: C chosen, I installed, R resolved, Inv invalid, U TLOC unresolved, Rej rejected, S stale. Invalid aur unresolved route ka matlab TLOC ya tunnel problem hai, route nahi. OMP har edge aur Controller ke beech chalta hai; edges aapas mein peer nahi karte.</p></div>

<div class="scn"><h4>Pune ko koi nahi dikhta</h4><p>Policy change ke baad E-BLR-1 Delhi ke alawa kisi tak nahi pahunch paa raha tha. Controller ne E-BLR-1 ke liye R/I/S 1/1/1 dikhaya, yaani sirf ek route bheja. Nayi control policy mein BRANCHES-WEST naam ki site list mein site 300 nahi tha, aur default action reject tha. Site 300 list mein jodne se baaki chhe routes wapas aa gaye.</p><p><b>Lesson:</b> edge ko chhune se pehle Controller par routes received aur sent compare karo.</p></div>

<div class="iv"><p class="q">"Branch ko remote LAN prefix nahi milta. Kahan khoya yeh kaise dhoondhoge?"</p><p>Main route ko counters ke saath chaar stages mein follow karta hoon: origin ne advertise kiya, Controller ne receive kiya, Controller ne bheja ya control policy filter karti hai, aur receiver par installed hai, jahan status letters batate hain ki TLOC unresolved hone se invalid hai ya nahi. Edge par show sdwan omp summary aur routes, Controller par show omp peers use karta hoon, aur agar wahi prefix doosra protocol seekhe to administrative distance check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route ko chaar stages mein follow karo: advertised, received, forwarded, installed.</li>
<li>Controller par show omp peers har edge ke liye routes received, installed aur sent deta hai.</li>
<li>Status C,I,R healthy hai; Inv,U matlab TLOC unresolved hai.</li>
<li>Received theek lekin sent kam ho to aam wajah Controller par control policy hai.</li>
<li>OMP routes ki administrative distance 251 hai.</li>
</ul></div>
`}};export{e as default};