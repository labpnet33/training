var e={id:`overview`,h:{en:`One cable, three jobs: what you will learn and the big picture`,hi:`Ek cable, teen kaam: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will connect IP telephones to Juniper EX switches the professional way: power them with <b>Power over Ethernet (PoE)</b> and manage the power budget, let <b>LLDP and LLDP-MED</b> introduce the phone and tell it its voice VLAN, and carry <b>tagged voice and untagged PC data</b> on the same access port with a voice VLAN. You will also learn how to troubleshoot dark phones with real output. These are the IP Telephony objectives of JNCIP-ENT (JN0-650).</p>
<p><b>Prerequisites.</b> VLANs, access and trunk ports (jncis-switching) and basic CoS ideas. You do not need to know SIP or call servers; the call server is just a host in the voice VLAN.</p>

<h3>Analogy: a hotel room with one socket and one door</h3>
<p>A guest arrives at a hotel room that has only one door and one socket. The hotel must (1) <b>supply electricity</b> through the socket so the guest's equipment can start, (2) <b>greet the guest and tell the room number</b> so deliveries go to the right place, and (3) keep the guest's <b>work mail</b> and their <b>phone calls</b> in separate lanes through the one door. In our network, the guest is the IP phone, electricity is PoE, the greeting is LLDP-MED, and the two lanes are the data VLAN (untagged) and the voice VLAN (tagged).</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="One cable three jobs">
<rect x="20" y="70" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="96" text-anchor="middle" class="svg-ink" font-size="13">EX switch</text><text x="85" y="114" text-anchor="middle" class="svg-muted" font-size="11">PSE, PoE budget</text>
<rect x="270" y="70" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="335" y="96" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text><text x="335" y="114" text-anchor="middle" class="svg-muted" font-size="11">PD with PC port</text>
<rect x="500" y="70" width="120" height="60" rx="10" fill="#fde68a"/><text x="560" y="106" text-anchor="middle" class="svg-ink" font-size="13">PC</text>
<line x1="150" y1="100" x2="270" y2="100" stroke="#64748b" stroke-width="3"/><line x1="400" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="210" y="60" text-anchor="middle" class="svg-accent" font-size="12">1 Power (PoE)</text><text x="210" y="150" text-anchor="middle" class="svg-accent" font-size="12">2 Policy (LLDP-MED)</text><text x="210" y="172" text-anchor="middle" class="svg-accent" font-size="12">3 Voice tagged + data untagged</text>
</svg><p class="cap">The switch powers the phone, tells it the voice VLAN, and the PC rides through the phone.</p></div>

<h3>The three jobs, in order</h3>
<table class="cmp"><tr><th>Job</th><th>Technology</th><th>If it fails</th></tr>
<tr><td>1. Power</td><td>PoE: 802.3af / at / bt</td><td>phone is dark; PC behind it loses its link too</td></tr>
<tr><td>2. Introduce and instruct</td><td>LLDP, LLDP-MED network policy</td><td>phone boots but sends voice untagged into the data VLAN</td></tr>
<tr><td>3. Separate traffic</td><td>voice VLAN (tagged) + data VLAN (untagged)</td><td>phone cannot register, or voice and data mix</td></tr></table>
<p>Always check them in this order. A phone cannot learn a VLAN if it has no power, and a voice VLAN is useless if the phone never hears about it.</p>

<div class="eg"><p><b>Worked example.</b> Mysuru sales floor. Switch ACC1 (EX2300-24P, 124 W PoE budget). PHONE1 on ge-0/0/1 has a sales PC behind it; PHONE2 is a lobby phone on ge-0/0/2; the call server is on VOICE (VLAN 20, 10.20.0.0/24); PCs live in DATA (VLAN 10, 10.10.0.0/24). You will power both phones, give the ports VOICE as voice VLAN, let LLDP-MED hand VLAN 20 to the phones and prove that both voice and PC data work. That is the first lab.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating the voice VLAN as a trunk. The phone port stays an <b>access port</b> in the data VLAN. The voice VLAN is an addition that is tagged on that port. Making it a trunk would also send tagged frames to the PC and break it.</p></div>
<div class="exam"><p><b>Exam trap.</b> LLDP-MED does not power the phone. PoE does that. LLDP-MED only <i>informs</i> (and can negotiate power levels).</p></div>

<div class="scn"><h4>The silent floor on the first morning</h4><p>A new call centre floor opened with 40 phones. At 08:55 half the phones were dark. The switches were new, the cables good. The reason: the PoE budget of the switch was 124 W and the default static allocation reserves 15.4 W per port, so only eight ports could power up. Two simple settings, class-based management and a guard band, powered all 40 phones with room to spare.</p><p><b>Lesson:</b> power is a finite resource; plan it as carefully as bandwidth.</p></div>

<div class="iv"><p class="q">"What three things must an EX switch do for an IP phone to work?"</p><p>Power it with PoE, introduce itself with LLDP/LLDP-MED so the phone learns its voice VLAN and priority, and carry the voice VLAN tagged and the PC's data VLAN untagged on one access port. I verify them in that order: power, policy, VLAN.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A phone needs power, policy and a voice VLAN, in that order.</li>
<li>PoE powers the phone; LLDP-MED informs it; the voice VLAN separates its traffic.</li>
<li>The phone port is an access port in the data VLAN with the voice VLAN added tagged.</li>
<li>A dark phone also takes the PC behind it offline.</li>
<li>The PoE budget is finite and must be planned.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap IP telephones ko Juniper EX switches se professional tareeke se jodna seekhoge: unhe <b>Power over Ethernet (PoE)</b> se power doge aur power budget sambhaloge, <b>LLDP aur LLDP-MED</b> se phone ka parichay karwaoge aur use uska voice VLAN bataoge, aur voice VLAN se ek hi access port par <b>tagged voice aur untagged PC data</b> chalaoge. Asli output se dark phones troubleshoot karna bhi seekhoge. Yeh JNCIP-ENT (JN0-650) ke IP Telephony objectives hain.</p>
<p><b>Prerequisites.</b> VLANs, access aur trunk ports (jncis-switching) aur basic CoS ideas. SIP ya call servers aane zaroori nahi; call server bas voice VLAN ka ek host hai.</p>

<h3>Analogy: ek socket aur ek darwaze wala hotel room</h3>
<p>Ek guest aisa hotel room paata hai jisme sirf ek darwaza aur ek socket hai. Hotel ko (1) socket se <b>bijli deni hai</b> taaki guest ka saman chalu ho, (2) <b>guest ka swagat karke room number batana hai</b> taaki deliveries sahi jagah jaayein, aur (3) guest ki <b>work mail</b> aur <b>phone calls</b> ko ek hi darwaze ke andar alag lanes mein rakhna hai. Hamare network mein guest IP phone hai, bijli PoE hai, swagat LLDP-MED hai, aur do lanes data VLAN (untagged) aur voice VLAN (tagged) hain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Ek cable teen kaam">
<rect x="20" y="70" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="96" text-anchor="middle" class="svg-ink" font-size="13">EX switch</text><text x="85" y="114" text-anchor="middle" class="svg-muted" font-size="11">PSE, PoE budget</text>
<rect x="270" y="70" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="335" y="96" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text><text x="335" y="114" text-anchor="middle" class="svg-muted" font-size="11">PC port wala PD</text>
<rect x="500" y="70" width="120" height="60" rx="10" fill="#fde68a"/><text x="560" y="106" text-anchor="middle" class="svg-ink" font-size="13">PC</text>
<line x1="150" y1="100" x2="270" y2="100" stroke="#64748b" stroke-width="3"/><line x1="400" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="210" y="60" text-anchor="middle" class="svg-accent" font-size="12">1 Power (PoE)</text><text x="210" y="150" text-anchor="middle" class="svg-accent" font-size="12">2 Policy (LLDP-MED)</text><text x="210" y="172" text-anchor="middle" class="svg-accent" font-size="12">3 Voice tagged + data untagged</text>
</svg><p class="cap">Switch phone ko power deta hai, voice VLAN batata hai, aur PC phone ke through jaata hai.</p></div>

<h3>Teen kaam, order mein</h3>
<table class="cmp"><tr><th>Kaam</th><th>Technology</th><th>Fail ho to</th></tr>
<tr><td>1. Power</td><td>PoE: 802.3af / at / bt</td><td>phone dark; uske peeche ka PC bhi link kho deta hai</td></tr>
<tr><td>2. Parichay aur instruction</td><td>LLDP, LLDP-MED network policy</td><td>phone boot hota hai par voice untagged data VLAN mein bhejta hai</td></tr>
<tr><td>3. Traffic alag karna</td><td>voice VLAN (tagged) + data VLAN (untagged)</td><td>phone register nahi hota, ya voice aur data mix</td></tr></table>
<p>Hamesha isi order mein check karo. Power ke bina phone VLAN nahi seekh sakta, aur phone ko voice VLAN ke baare mein pata hi na chale to voice VLAN bekaar hai.</p>

<div class="eg"><p><b>Worked example.</b> Mysuru sales floor. Switch ACC1 (EX2300-24P, 124 W PoE budget). ge-0/0/1 par PHONE1 ke peeche sales PC hai; PHONE2 ge-0/0/2 par lobby phone hai; call server VOICE (VLAN 20, 10.20.0.0/24) par hai; PCs DATA (VLAN 10, 10.10.0.0/24) mein. Aap dono phones ko power doge, ports ko VOICE voice VLAN doge, LLDP-MED se VLAN 20 phones tak pahunchaoge aur sabit karoge ki voice aur PC data dono chalte hain. Yahi pehla lab hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Voice VLAN ko trunk samajhna. Phone port <b>access port</b> hi rehta hai data VLAN mein. Voice VLAN us port par tagged ek addition hai. Trunk banane se PC ko bhi tagged frames jaate hain aur woh tut jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> LLDP-MED phone ko power nahi deta. Woh PoE karta hai. LLDP-MED sirf <i>inform</i> karta hai (aur power levels negotiate kar sakta hai).</p></div>

<div class="scn"><h4>Pehli subah ka sannata</h4><p>Naye call centre floor par 40 phones ke saath opening hui. 08:55 par aadhe phones dark the. Switches naye the, cables theek. Wajah: switch ka PoE budget 124 W tha aur default static allocation har port par 15.4 W reserve karta hai, isliye sirf aath ports power ho paaye. Do simple settings, class-based management aur guard band, ne saare 40 phones ko power diya aur jagah bachi.</p><p><b>Lesson:</b> power bhi bandwidth jitna hi plan karne wali finite resource hai.</p></div>

<div class="iv"><p class="q">"IP phone ke chalne ke liye EX switch ko kaunse teen kaam karne padte hain?"</p><p>PoE se power dena, LLDP/LLDP-MED se parichay dena taaki phone voice VLAN aur priority seekhe, aur ek access port par voice VLAN tagged aur PC ka data VLAN untagged carry karna. Main isi order mein verify karta hoon: power, policy, VLAN.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phone ko order mein power, policy aur voice VLAN chahiye.</li>
<li>PoE phone ko power deta hai; LLDP-MED inform karta hai; voice VLAN uska traffic alag karta hai.</li>
<li>Phone port data VLAN ka access port hai jisme voice VLAN tagged jodi jaati hai.</li>
<li>Dark phone uske peeche ke PC ko bhi offline kar deta hai.</li>
<li>PoE budget finite hai aur plan karna padta hai.</li>
</ul></div>
`}};export{e as default};