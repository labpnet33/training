var e={id:`layered-method`,h:{en:`Reading PIM and IGMP state together: a layered method`,hi:`PIM aur IGMP state saath padhna: layered method`},body:{en:`
<p>Multicast is a chain. A receiver asks with IGMP, the last-hop router builds a (*,G), PIM carries the join to the RP, the RP learns the source, data flows back down. A fault anywhere breaks the chain, and the symptom is always the same: "no video". The way to stay calm is to test the chain <b>one link at a time, from the receiver toward the source</b>, and to stop at the first layer that is wrong.</p>

<h3>Why receiver first?</h3>
<p>The receiver is where the complaint is, and its router knows exactly what it is waiting for. Each layer you check also tells you which layers are healthy, so you never test the same thing twice. The method has six layers.</p>
<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Six layer method from receiver to source">
<rect x="20" y="10" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">1  Receiver LAN: IGMP group present?  (show ip igmp groups)</text>
<rect x="20" y="54" width="600" height="38" rx="8" fill="#bae6fd"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">2  PIM on the LAN and on every link of the path  (show ip pim interface / neighbor)</text>
<rect x="20" y="98" width="600" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">3  RP known and the same everywhere  (show ip pim rp mapping)</text>
<rect x="20" y="142" width="600" height="38" rx="8" fill="#fde68a"/><text x="320" y="166" text-anchor="middle" class="svg-ink" font-size="13">4  (*,G) with a valid incoming interface  (show ip mroute, show ip rpf RP)</text>
<rect x="20" y="186" width="600" height="38" rx="8" fill="#fed7aa"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">5  (S,G) and its RPF toward the source  (show ip mroute, show ip rpf source)</text>
<rect x="20" y="230" width="600" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="254" text-anchor="middle" class="svg-ink" font-size="13">6  Source: is it sending, with a TTL above 1?  (first-hop router has (S,G) with F)</text>
</svg><p class="cap">Stop at the first layer that is wrong. Fix it, then re-run from that layer.</p></div>

<h3>Layer by layer, with the question and the evidence</h3>
<table class="cmp"><tr><th>Layer</th><th>Question</th><th>Healthy looks like</th><th>Typical fault</th></tr>
<tr><td>1 IGMP</td><td>Does the last-hop router know the receiver?</td><td>the group listed on the LAN interface</td><td>no <code>ip pim</code> on the LAN, wrong IGMP version</td></tr>
<tr><td>2 PIM</td><td>Is there a neighbour on each hop?</td><td>every transit interface shows v2/S and a neighbour count</td><td>PIM missing on one end</td></tr>
<tr><td>3 RP</td><td>Does every router use the same RP?</td><td>one RP address in every mapping</td><td>typo in the RP, no mapping learned</td></tr>
<tr><td>4 (*,G)</td><td>Can the join reach the RP?</td><td>incoming interface and RPF neighbour are real</td><td>RPF toward the RP wrong</td></tr>
<tr><td>5 (S,G)</td><td>Does the source tree build?</td><td>flag T, incoming interface toward the source</td><td>RPF toward the source wrong</td></tr>
<tr><td>6 Source</td><td>Is anything being sent?</td><td>first-hop (S,G) with flag F</td><td>TTL 1, source on a LAN without PIM</td></tr></table>

<h3>Real evidence from the four-city capstone</h3>
<p>In the capstone, no branch gets the Deccan Broadcast news channel (239.88.1.1). One check per city finds a different layer. In Pune, layer 2 and layer 1:</p>
<pre class="out">R-PUN# show ip pim interface

Address          Interface                Ver/   Nbr    Query  DR         DR
                                          Mode   Count  Intvl  Prior
10.0.2.2         <span class="hl">GigabitEthernet0/1</span>       v2/S   1      30     1          10.0.2.2</pre>
<p>Only the WAN interface is listed. The receiver LAN interface is missing, so IGMP never starts there: layer 2 fails and layer 1 can never succeed. In Delhi, layer 3:</p>
<pre class="out">R-DEL# show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s): 224.0.0.0/4, Static
    <span class="hl">RP: 10.1.255.9 (?)</span></pre>
<p>Every other router uses 10.1.255.1. Delhi joins toward an address that no one owns. In Chennai, layers 4 and 5 (the RPF check):</p>
<pre class="out">R-CHE# show ip mroute 239.88.1.1
(*, 239.88.1.1), 00:01:00/00:03:00, RP 10.1.255.1, flags: SC
  Incoming interface: <span class="hl">Null</span>, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:01:00/00:03:00</pre>
<p>Three cities, three different layers, one method. Because each layer is independent, you can also work on all three at once as soon as you have the evidence.</p>

<h3>Working with two ends of one link</h3>
<p>Some checks are about a <b>pair</b> of routers. A PIM adjacency needs PIM on both ends of a link, and the neighbour table on each side tells you whether the other end answered. Use <code>show ip pim neighbor</code> on both sides; the one whose table is empty is the side that is not hearing Hellos.</p>
<pre class="out">R-CHE# show ip pim neighbor
PIM Neighbor Table
Neighbor          Interface                Uptime/Expires    Ver   DR
Address                                                            Prio/Mode
10.0.4.1          GigabitEthernet0/1       00:01:24/00:01:21 v2    1 / S P G</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Starting at the source because "that is where the stream begins": you then test healthy layers first. (2) Fixing two things at once without testing between them: you will not know which one worked. (3) Trusting a receiver PC's own display: use <code>show mcast</code> counters on the PC or the OIL on the router.</p></div>
<div class="exam"><p><b>Exam trap.</b> "The group appears in <code>show ip igmp groups</code>, so multicast routing works." No: IGMP only proves layer 1. The tree still needs layers 2 to 5.</p></div>

<div class="scn"><h4>One ticket, three causes</h4><p>The night after a launch, the NOC received "no news channel in any branch". The first reaction was to suspect the head end. A senior engineer instead opened three terminals, one per branch, and ran the same six-layer check. Pune failed at layer 2 (PIM missing on the LAN), Delhi at layer 3 (typo in the RP), Chennai at layer 4 (RPF through the Internet circuit). Three small fixes, forty minutes. The head end had been healthy all along.</p><p><b>Lesson:</b> one symptom can hide several independent faults. Test every branch with the same method, not with a theory.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot 'no multicast video at a branch'."</p><p>Say: from the receiver toward the source. IGMP on the last-hop router, PIM on every hop, the RP and that all routers agree, the (*,G) and its RPF toward the RP, the (S,G) and its RPF toward the source, and finally the source itself and the TTL. Name the command at each layer and say you stop at the first failure.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Test the chain from the receiver toward the source and stop at the first wrong layer.</li>
<li>Six layers: IGMP, PIM adjacency, RP, (*,G) RPF, (S,G) RPF, source and TTL.</li>
<li>Each layer has one show command and one typical fault.</li>
<li>Several independent faults can hide behind one symptom: test every branch the same way.</li>
<li>For adjacency problems check the neighbour table on both ends of the link.</li>
</ul></div>
`,hi:`
<p>Multicast ek chain hai. Receiver IGMP se maangta hai, last-hop router (*,G) banata hai, PIM join ko RP tak le jaata hai, RP source ko seekhta hai, data neeche wapas bahta hai. Kahin bhi fault chain tod deta hai, aur symptom hamesha ek: "video nahi". Shaant rehne ka tareeka hai chain ko <b>ek-ek kadi karke, receiver se source ki taraf</b> test karna, aur pehli galat layer par ruk jaana.</p>

<h3>Receiver pehle kyun?</h3>
<p>Shikayat receiver par hai, aur uska router jaanta hai ki woh kiska intezaar kar raha hai. Har layer jo aap check karte ho woh yeh bhi batati hai ki kaunsi layers theek hain, isliye aap ek cheez do baar test nahi karte. Method mein chhe layers hain.</p>
<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Receiver se source tak chhe layer method">
<rect x="20" y="10" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">1  Receiver LAN: IGMP group maujood?  (show ip igmp groups)</text>
<rect x="20" y="54" width="600" height="38" rx="8" fill="#bae6fd"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">2  LAN aur path ke har link par PIM  (show ip pim interface / neighbor)</text>
<rect x="20" y="98" width="600" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">3  RP maaloom aur sab jagah same  (show ip pim rp mapping)</text>
<rect x="20" y="142" width="600" height="38" rx="8" fill="#fde68a"/><text x="320" y="166" text-anchor="middle" class="svg-ink" font-size="13">4  (*,G) valid incoming interface ke saath  (show ip mroute, show ip rpf RP)</text>
<rect x="20" y="186" width="600" height="38" rx="8" fill="#fed7aa"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">5  (S,G) aur source ki taraf uska RPF  (show ip mroute, show ip rpf source)</text>
<rect x="20" y="230" width="600" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="254" text-anchor="middle" class="svg-ink" font-size="13">6  Source: bhej raha hai, TTL 1 se zyada?  (first-hop par F wali (S,G))</text>
</svg><p class="cap">Pehli galat layer par ruko. Theek karo, phir us layer se dobara chalao.</p></div>

<h3>Layer by layer, sawaal aur evidence ke saath</h3>
<table class="cmp"><tr><th>Layer</th><th>Sawaal</th><th>Theek kaisa dikhta hai</th><th>Aam fault</th></tr>
<tr><td>1 IGMP</td><td>Kya last-hop router receiver ko jaanta hai?</td><td>LAN interface par group listed</td><td>LAN par <code>ip pim</code> nahi, galat IGMP version</td></tr>
<tr><td>2 PIM</td><td>Har hop par neighbour hai?</td><td>har transit interface v2/S aur neighbour count dikhata hai</td><td>ek end par PIM missing</td></tr>
<tr><td>3 RP</td><td>Kya har router same RP use karta hai?</td><td>har mapping mein ek hi RP address</td><td>RP mein typo, mapping seekhi nahi</td></tr>
<tr><td>4 (*,G)</td><td>Kya join RP tak pahunch sakta hai?</td><td>incoming interface aur RPF neighbour asli hain</td><td>RP ki taraf RPF galat</td></tr>
<tr><td>5 (S,G)</td><td>Kya source tree banta hai?</td><td>flag T, source ki taraf incoming interface</td><td>source ki taraf RPF galat</td></tr>
<tr><td>6 Source</td><td>Kuch bheja ja raha hai?</td><td>first-hop (S,G) flag F ke saath</td><td>TTL 1, source aise LAN par jahan PIM nahi</td></tr></table>

<h3>Four-city capstone se asli evidence</h3>
<p>Capstone mein koi branch Deccan Broadcast ka news channel (239.88.1.1) nahi pa raha. Har city mein ek check alag layer dhoondhta hai. Pune mein, layer 2 aur layer 1:</p>
<pre class="out">R-PUN# show ip pim interface

Address          Interface                Ver/   Nbr    Query  DR         DR
                                          Mode   Count  Intvl  Prior
10.0.2.2         <span class="hl">GigabitEthernet0/1</span>       v2/S   1      30     1          10.0.2.2</pre>
<p>Sirf WAN interface listed hai. Receiver LAN interface gayab hai, isliye wahan IGMP shuru hi nahi hota: layer 2 fail hai aur layer 1 kabhi succeed nahi ho sakti. Delhi mein, layer 3:</p>
<pre class="out">R-DEL# show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s): 224.0.0.0/4, Static
    <span class="hl">RP: 10.1.255.9 (?)</span></pre>
<p>Baaki har router 10.1.255.1 use karta hai. Delhi aise address ki taraf join karta hai jiska koi malik nahi. Chennai mein, layers 4 aur 5 (RPF check):</p>
<pre class="out">R-CHE# show ip mroute 239.88.1.1
(*, 239.88.1.1), 00:01:00/00:03:00, RP 10.1.255.1, flags: SC
  Incoming interface: <span class="hl">Null</span>, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:01:00/00:03:00</pre>
<p>Teen cities, teen alag layers, ek method. Kyunki har layer independent hai, evidence milte hi aap teeno par ek saath kaam bhi kar sakte ho.</p>

<h3>Ek link ke do ends ke saath kaam</h3>
<p>Kuch checks routers ki <b>jodi</b> ke baare mein hote hain. PIM adjacency ke liye link ke dono ends par PIM chahiye, aur har side ki neighbour table batati hai ki doosre end ne jawab diya ya nahi. Dono sides par <code>show ip pim neighbor</code> chalao; jiski table khaali hai woh side Hellos nahi sun rahi.</p>
<pre class="out">R-CHE# show ip pim neighbor
PIM Neighbor Table
Neighbor          Interface                Uptime/Expires    Ver   DR
Address                                                            Prio/Mode
10.0.4.1          GigabitEthernet0/1       00:01:24/00:01:21 v2    1 / S P G</pre>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Source se shuru karna kyunki "stream wahin se shuru hoti hai": tab aap pehle theek layers test karte ho. (2) Do cheezein ek saath theek karna aur beech mein test na karna: pata nahi chalega kaunsi kaam ki. (3) Receiver PC ke apne display par bharosa karna: PC par <code>show mcast</code> counters ya router par OIL use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Group <code>show ip igmp groups</code> mein dikh raha hai, to multicast routing chal rahi hai." Nahi: IGMP sirf layer 1 prove karta hai. Tree ko abhi bhi layers 2 se 5 chahiye.</p></div>

<div class="scn"><h4>Ek ticket, teen karan</h4><p>Launch ki raat NOC ko "kisi branch mein news channel nahi" mila. Pehla reaction head end par shak karna tha. Ek senior engineer ne teen terminals kholey, har branch ke liye ek, aur wahi chhe-layer check chalaya. Pune layer 2 par fail (LAN par PIM missing), Delhi layer 3 par (RP mein typo), Chennai layer 4 par (Internet circuit se RPF). Teen chhote fixes, chalis minute. Head end shuru se theek tha.</p><p><b>Lesson:</b> ek symptom ke peeche kai independent faults ho sakte hain. Har branch ko same method se test karo, theory se nahi.</p></div>

<div class="iv"><p class="q">"Mujhe batao aap 'branch mein multicast video nahi' ko kaise troubleshoot karte ho."</p><p>Kaho: receiver se source ki taraf. Last-hop router par IGMP, har hop par PIM, RP aur ki sab routers agree karte hain, (*,G) aur RP ki taraf uska RPF, (S,G) aur source ki taraf uska RPF, aur aakhir mein source khud aur TTL. Har layer ka command batao aur kaho aap pehli failure par ruk jaate ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chain ko receiver se source ki taraf test karo aur pehli galat layer par ruko.</li>
<li>Chhe layers: IGMP, PIM adjacency, RP, (*,G) RPF, (S,G) RPF, source aur TTL.</li>
<li>Har layer ka ek show command aur ek aam fault hai.</li>
<li>Ek symptom ke peeche kai independent faults ho sakte hain: har branch same tareeke se test karo.</li>
<li>Adjacency problems mein link ke dono ends par neighbour table check karo.</li>
</ul></div>
`}};export{e as default};