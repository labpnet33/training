var e={id:`duplex`,h:{en:`Half vs full duplex, CSMA/CD and collision domains`,hi:`Half vs full duplex, CSMA/CD aur collision domains`},body:{en:`
<p>Think of a walkie-talkie and a phone call. With a walkie-talkie only one person can talk at a time: you press the button, speak, say "over" and release. If both press at once, both messages are garbled. That is <b>half duplex</b>. On a phone call both people can talk and listen at the same time. That is <b>full duplex</b>. Ethernet began as a walkie-talkie and grew into a phone call, and a lot of CCNA troubleshooting comes from the moment a link forgets which one it is.</p>

<h3>Half duplex and why it needed rules</h3>
<p>Early Ethernet used one shared coaxial cable, and later a <b>hub</b>, which simply repeats every bit it receives out of every other port. All devices were electrically on the same wire. If two sent at the same moment, their signals overlapped and both frames were destroyed. This is a <b>collision</b>, and the group of devices that can collide with each other is a <b>collision domain</b>.</p>
<p>To share the wire fairly, Ethernet used <b>CSMA/CD</b> (carrier sense multiple access with collision detection):</p>
<ol>
<li><b>Carrier sense</b>: listen before talking. If someone is transmitting, wait.</li>
<li><b>Multiple access</b>: when the wire is quiet, anyone may transmit.</li>
<li><b>Collision detection</b>: keep listening while transmitting. If what you hear is not what you are sending, a collision happened.</li>
<li>On a collision, send a short <b>jam signal</b> so everybody notices, stop, and wait a <b>random backoff</b> time before retrying. After each collision the random range doubles (truncated binary exponential backoff); after 16 failed attempts the frame is discarded.</li>
</ol>

<h3>The 64-byte rule and late collisions</h3>
<p>A sender can only detect a collision while it is still transmitting. So Ethernet requires every frame to be long enough that, on a network within the length limits, any collision reaches the sender before it finishes. That time is the <b>slot time</b>: 512 bit times, which is <b>64 bytes</b>. This is exactly why the minimum Ethernet frame is 64 bytes.</p>
<p>A collision detected <b>after</b> the first 64 bytes have been sent is a <b>late collision</b>. On a correctly built half-duplex network it should never happen. When you see late collisions, there are really only two causes: the cable or collision domain is <b>too long</b>, or, far more often today, a <b>duplex mismatch</b>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Duplex mismatch between R1 half and SW1 full">
<rect x="30" y="60" width="140" height="70" rx="8" fill="#bae6fd"/><text x="100" y="90" text-anchor="middle" class="svg-ink" font-size="14">R1 Fa0/0</text><text x="100" y="110" text-anchor="middle" class="svg-accent" font-size="13">half duplex</text>
<rect x="470" y="60" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="540" y="90" text-anchor="middle" class="svg-ink" font-size="14">SW1 Fa0/1</text><text x="540" y="110" text-anchor="middle" class="svg-accent" font-size="13">full duplex</text>
<line x1="170" y1="80" x2="470" y2="80" stroke="#64748b" stroke-width="2"/><polygon points="470,80 460,75 460,85" fill="#64748b"/>
<line x1="170" y1="112" x2="470" y2="112" stroke="#64748b" stroke-width="2"/><polygon points="170,112 180,107 180,117" fill="#64748b"/>
<text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">R1 sends a long frame</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">SW1 sends at the same time (it is allowed to)</text>
<rect x="30" y="160" width="270" height="44" rx="8" fill="#fde68a"/><text x="165" y="187" text-anchor="middle" class="svg-ink" font-size="12">R1: "collision!" stops, late collisions</text>
<rect x="340" y="160" width="270" height="44" rx="8" fill="#fed7aa"/><text x="475" y="187" text-anchor="middle" class="svg-ink" font-size="12">SW1: cut frames, runts and CRC</text>
</svg><p class="cap">The half-duplex side counts collisions; the full-duplex side counts damaged frames.</p></div>

<h3>Full duplex: collisions disappear</h3>
<p>A <b>switch</b> gives every port its own point-to-point link. With twisted pair, each direction has its own wires (or, for gigabit, echo cancellation separates the directions). There is nothing to collide with, so both ends can send and receive at once. In <b>full duplex</b> mode:</p>
<ul>
<li>CSMA/CD is <b>switched off</b>: the device does not listen before sending and never backs off.</li>
<li>Effective throughput doubles: a 100 Mbps full-duplex link can carry 100 Mbps in each direction.</li>
<li>Collision and late-collision counters should always stay at zero.</li>
</ul>

<h3>Collision domains and broadcast domains</h3>
<table class="cmp"><tr><th>Device</th><th>Collision domains</th><th>Broadcast domains</th></tr>
<tr><td>Hub (Layer 1)</td><td>All ports share one</td><td>One</td></tr>
<tr><td>Switch (Layer 2)</td><td>One per port</td><td>One per VLAN</td></tr>
<tr><td>Router (Layer 3)</td><td>One per interface</td><td>One per interface</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A small office has one router, one 24-port switch with all devices in VLAN 1, and one old 8-port hub plugged into switch port 24 with 5 PCs on it. Switch ports 1 to 23 each connect one device (the router's LAN interface is on port 1): that is 23 collision domains. The hub, its 5 PCs and switch port 24 share one more. Total: <b>24 collision domains</b>. Broadcast domains: the whole of VLAN 1 is <b>one</b>, including the hub PCs; the router's WAN interface is another.</p></div>

<h3>Where half duplex still lives</h3>
<p>Half duplex on wired Ethernet is rare now, but you meet it in three places: very old devices and hubs, links where auto-negotiation failed (chapter 7), and <b>Wi-Fi</b>. Wireless is inherently half duplex on a channel and uses a cousin of CSMA/CD called <b>CSMA/CA</b> (collision avoidance), because a radio cannot hear while it transmits. You will study that in the wireless module.</p>

<div class="warn"><p><b>Common mistakes.</b> Thinking collisions are normal on a switch port. On a full-duplex switched link, any collision counter above zero means something is misconfigured. Also, believing that "half duplex" means half the speed: it means the link cannot send and receive at the same time.</p></div>

<div class="exam"><p><b>Exam trap.</b> CSMA/CD is used only in half duplex. Late collisions are the fingerprint of a duplex mismatch (or an over-long cable). Each switch port is its own collision domain; a hub is one collision domain for all its ports; only routers (and VLANs) split broadcast domains.</p></div>

<div class="scn"><h4>The hub under the desk</h4><p>A finance team complained that their shared printer and two PCs were slow. <code>show interfaces</code> on the access port showed <code>Half-duplex, 10Mb/s</code> and steadily growing collisions. Under a desk the engineer found an old 10 Mbps hub someone had brought in to add ports. The whole team was sharing one 10 Mbps half-duplex collision domain. Replacing the hub with a small managed switch gave each device full-duplex 100 Mbps and collisions stopped.</p><p><b>Lesson:</b> collisions on a switch port mean a half-duplex device or a mismatch. Find out which.</p></div>

<div class="iv"><p class="q">"What is CSMA/CD and is it still used?"</p><p>Strong answer: it is the half-duplex Ethernet access method. Listen for carrier, transmit when idle, detect collisions while transmitting, send a jam, back off randomly with exponential backoff, give up after 16 tries. The 64-byte minimum frame exists so collisions are detected within the slot time. In full duplex, which every modern switched link uses, CSMA/CD is disabled. It matters today mainly for recognising duplex mismatches, whose half-duplex side logs late collisions. Wi-Fi uses CSMA/CA instead.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Half duplex: send or receive, not both; needs CSMA/CD. Full duplex: both at once; CSMA/CD off.</li>
<li>A collision domain is the set of devices whose frames can collide; each switch port is one.</li>
<li>Slot time = 512 bits = 64 bytes, which sets the minimum frame size.</li>
<li>Late collisions (after 64 bytes) mean a duplex mismatch or an over-long cable.</li>
<li>Switches split collision domains; routers and VLANs split broadcast domains.</li>
</ul></div>
`,hi:`
<p>Walkie-talkie aur phone call ke baare mein socho. Walkie-talkie par ek waqt mein sirf ek insaan bol sakta hai: button dabao, bolo, "over" kaho aur chhod do. Agar dono ek saath dabayein, dono ke message bigad jaate hain. Yahi <b>half duplex</b> hai. Phone call par dono log ek saath bol aur sun sakte hain. Yahi <b>full duplex</b> hai. Ethernet walkie-talkie ki tarah shuru hua aur phone call ban gaya, aur CCNA troubleshooting ka bahut bada hissa us pal se aata hai jab link bhool jaata hai ki woh kaunsa hai.</p>

<h3>Half duplex aur use rules kyun chahiye the</h3>
<p>Shuruaati Ethernet ek shared coaxial cable use karta tha, aur baad mein <b>hub</b>, jo har receive kiya hua bit har dusre port se repeat kar deta hai. Saare devices electrically ek hi wire par the. Agar do ne ek hi pal mein bheja, to unke signals overlap hue aur dono frames barbaad ho gaye. Ise <b>collision</b> kehte hain, aur devices ka woh group jo aapas mein collide kar sakta hai <b>collision domain</b> kehlata hai.</p>
<p>Wire ko fairly share karne ke liye Ethernet ne <b>CSMA/CD</b> (carrier sense multiple access with collision detection) use kiya:</p>
<ol>
<li><b>Carrier sense</b>: bolne se pehle suno. Agar koi transmit kar raha hai, intezaar karo.</li>
<li><b>Multiple access</b>: jab wire shaant ho, koi bhi transmit kar sakta hai.</li>
<li><b>Collision detection</b>: transmit karte waqt sunte raho. Agar jo sun rahe ho woh wahi nahi jo bhej rahe ho, collision hua.</li>
<li>Collision par ek chhota <b>jam signal</b> bhejo taaki sabko pata chale, ruko, aur retry se pehle ek <b>random backoff</b> time intezaar karo. Har collision ke baad random range double hoti hai (truncated binary exponential backoff); 16 fail attempts ke baad frame discard ho jaata hai.</li>
</ol>

<h3>64-byte rule aur late collisions</h3>
<p>Sender collision tabhi detect kar sakta hai jab woh abhi bhi transmit kar raha ho. Isliye Ethernet chahta hai ki har frame itna lamba ho ki length limits ke andar wale network par koi bhi collision sender ke khatam karne se pehle us tak pahunch jaaye. Us time ko <b>slot time</b> kehte hain: 512 bit times, yaani <b>64 bytes</b>. Isi wajah se minimum Ethernet frame 64 bytes ka hai.</p>
<p>Pehle 64 bytes bhejne ke <b>baad</b> detect hua collision <b>late collision</b> hai. Sahi bane half-duplex network par yeh kabhi nahi hona chahiye. Jab late collisions dikhein, to asal mein sirf do causes hote hain: cable ya collision domain <b>bahut lamba</b> hai, ya, aaj kal kahin zyada baar, <b>duplex mismatch</b>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="R1 half aur SW1 full ke beech duplex mismatch">
<rect x="30" y="60" width="140" height="70" rx="8" fill="#bae6fd"/><text x="100" y="90" text-anchor="middle" class="svg-ink" font-size="14">R1 Fa0/0</text><text x="100" y="110" text-anchor="middle" class="svg-accent" font-size="13">half duplex</text>
<rect x="470" y="60" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="540" y="90" text-anchor="middle" class="svg-ink" font-size="14">SW1 Fa0/1</text><text x="540" y="110" text-anchor="middle" class="svg-accent" font-size="13">full duplex</text>
<line x1="170" y1="80" x2="470" y2="80" stroke="#64748b" stroke-width="2"/><polygon points="470,80 460,75 460,85" fill="#64748b"/>
<line x1="170" y1="112" x2="470" y2="112" stroke="#64748b" stroke-width="2"/><polygon points="170,112 180,107 180,117" fill="#64748b"/>
<text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">R1 lamba frame bhejta hai</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">SW1 usi waqt bhejta hai (use ijaazat hai)</text>
<rect x="30" y="160" width="270" height="44" rx="8" fill="#fde68a"/><text x="165" y="187" text-anchor="middle" class="svg-ink" font-size="12">R1: "collision!" rukta hai, late collisions</text>
<rect x="340" y="160" width="270" height="44" rx="8" fill="#fed7aa"/><text x="475" y="187" text-anchor="middle" class="svg-ink" font-size="12">SW1: kate frames, runts aur CRC</text>
</svg><p class="cap">Half-duplex side collisions ginti hai; full-duplex side damaged frames ginti hai.</p></div>

<h3>Full duplex: collisions gayab</h3>
<p><b>Switch</b> har port ko uska apna point-to-point link deta hai. Twisted pair mein har direction ke apne wires hote hain (ya gigabit mein echo cancellation directions ko alag karta hai). Takraane ke liye kuch hai hi nahi, isliye dono ends ek saath bhej aur receive kar sakte hain. <b>Full duplex</b> mode mein:</p>
<ul>
<li>CSMA/CD <b>band</b> hota hai: device bhejne se pehle nahi sunta aur kabhi back off nahi karta.</li>
<li>Effective throughput double ho jaata hai: 100 Mbps full-duplex link har direction mein 100 Mbps le ja sakta hai.</li>
<li>Collision aur late-collision counters hamesha zero par rehne chahiye.</li>
</ul>

<h3>Collision domains aur broadcast domains</h3>
<table class="cmp"><tr><th>Device</th><th>Collision domains</th><th>Broadcast domains</th></tr>
<tr><td>Hub (Layer 1)</td><td>Saare ports ek share karte hain</td><td>Ek</td></tr>
<tr><td>Switch (Layer 2)</td><td>Har port ka ek</td><td>Har VLAN ka ek</td></tr>
<tr><td>Router (Layer 3)</td><td>Har interface ka ek</td><td>Har interface ka ek</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Ek chhote office mein ek router, ek 24-port switch jiske saare devices VLAN 1 mein hain, aur switch port 24 mein laga ek purana 8-port hub hai jis par 5 PCs hain. Switch ports 1 se 23 har ek ek device jodte hain (router ka LAN interface port 1 par hai): yeh 23 collision domains hain. Hub, uske 5 PCs aur switch port 24 ek aur share karte hain. Total: <b>24 collision domains</b>. Broadcast domains: poora VLAN 1 <b>ek</b> hai, hub PCs samet; router ka WAN interface ek aur hai.</p></div>

<h3>Half duplex aaj bhi kahan milta hai</h3>
<p>Wired Ethernet par half duplex ab rare hai, lekin teen jagah milta hai: bahut purane devices aur hubs, woh links jahan auto-negotiation fail hua (chapter 7), aur <b>Wi-Fi</b>. Wireless ek channel par swabhaav se half duplex hai aur CSMA/CD ka ek cousin <b>CSMA/CA</b> (collision avoidance) use karta hai, kyunki radio transmit karte waqt sun nahi sakta. Yeh aap wireless module mein padhoge.</p>

<div class="warn"><p><b>Common galtiyan.</b> Yeh sochna ki switch port par collisions normal hain. Full-duplex switched link par zero se upar koi bhi collision counter ka matlab hai kuch misconfigured hai. Aur yeh maanna ki "half duplex" ka matlab aadhi speed hai: iska matlab hai link ek saath bhej aur receive nahi kar sakta.</p></div>

<div class="exam"><p><b>Exam trap.</b> CSMA/CD sirf half duplex mein use hota hai. Late collisions duplex mismatch (ya bahut lambe cable) ka fingerprint hain. Har switch port apna collision domain hai; hub apne saare ports ke liye ek collision domain hai; sirf routers (aur VLANs) broadcast domains todte hain.</p></div>

<div class="scn"><h4>Desk ke neeche ka hub</h4><p>Ek finance team ne complain kiya ki unka shared printer aur do PCs slow hain. Access port par <code>show interfaces</code> mein <code>Half-duplex, 10Mb/s</code> aur lagataar badhte collisions dikhe. Engineer ko ek desk ke neeche ek purana 10 Mbps hub mila jo kisi ne ports badhane ke liye laga diya tha. Poori team ek 10 Mbps half-duplex collision domain share kar rahi thi. Hub ko chhote managed switch se badalne par har device ko full-duplex 100 Mbps mila aur collisions ruk gaye.</p><p><b>Seekh:</b> switch port par collisions ka matlab half-duplex device ya mismatch hai. Pata karo kaunsa.</p></div>

<div class="iv"><p class="q">"CSMA/CD kya hai aur kya aaj bhi use hota hai?"</p><p>Strong answer: yeh half-duplex Ethernet ka access method hai. Carrier ke liye suno, idle hone par transmit karo, transmit karte waqt collisions detect karo, jam bhejo, exponential backoff ke saath randomly back off karo, 16 tries ke baad chhod do. 64-byte minimum frame isliye hai taaki collisions slot time ke andar detect hon. Full duplex mein, jo har modern switched link use karta hai, CSMA/CD disabled hota hai. Aaj yeh mainly duplex mismatches pehchanne ke liye matter karta hai, jiski half-duplex side late collisions log karti hai. Wi-Fi iske bajaye CSMA/CA use karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Half duplex: bhejo ya receive karo, dono nahi; CSMA/CD chahiye. Full duplex: dono ek saath; CSMA/CD off.</li>
<li>Collision domain devices ka woh set hai jinke frames collide kar sakte hain; har switch port ek hai.</li>
<li>Slot time = 512 bits = 64 bytes, jo minimum frame size tay karta hai.</li>
<li>Late collisions (64 bytes ke baad) ka matlab duplex mismatch ya bahut lamba cable.</li>
<li>Switches collision domains todte hain; routers aur VLANs broadcast domains todte hain.</li>
</ul></div>
`}};export{e as default};