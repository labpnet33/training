var e={id:`mode-combinations`,h:{en:`The mode combination table`,hi:`Mode combination table`},body:{en:`
<p>Think of a phone call. For a call to happen, at least one person has to dial, and both have to speak the same language. Two people who both sit waiting for the phone to ring will never talk. A person who dials and speaks French will not get far with someone who only answers in Japanese. And someone who refuses to use the phone at all (mode on) can only "meet" another person who also refuses to use the phone and simply turns up. That is the whole mode table in three sentences. Now let us make it exam-proof.</p>

<h3>The three rules</h3>
<ol>
<li><b>Same protocol.</b> LACP modes (active, passive) only work with LACP modes. PAgP modes (desirable, auto) only work with PAgP modes.</li>
<li><b>At least one side must initiate.</b> active or desirable on at least one end. passive + passive and auto + auto never form a channel.</li>
<li><b>on only matches on.</b> Static mode sends no protocol packets, so it never pairs with any negotiating mode.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="EtherChannel mode combination matrix">
<text x="20" y="22" class="svg-muted" font-size="12">rows: switch A, columns: switch B</text>
<text x="188" y="48" text-anchor="middle" class="svg-ink" font-size="13">on</text>
<text x="284" y="48" text-anchor="middle" class="svg-ink" font-size="13">active</text>
<text x="380" y="48" text-anchor="middle" class="svg-ink" font-size="13">passive</text>
<text x="476" y="48" text-anchor="middle" class="svg-ink" font-size="13">desirable</text>
<text x="572" y="48" text-anchor="middle" class="svg-ink" font-size="13">auto</text>
<text x="128" y="80" text-anchor="end" class="svg-ink" font-size="13">on</text>
<rect x="142" y="60" width="92" height="30" rx="4" fill="#bbf7d0"/><text x="188" y="80" text-anchor="middle" class="svg-ink" font-size="12">channel</text>
<rect x="238" y="60" width="92" height="30" rx="4" fill="#fed7aa"/><text x="284" y="80" text-anchor="middle" class="svg-ink" font-size="12">no, risk</text>
<rect x="334" y="60" width="92" height="30" rx="4" fill="#fed7aa"/><text x="380" y="80" text-anchor="middle" class="svg-ink" font-size="12">no, risk</text>
<rect x="430" y="60" width="92" height="30" rx="4" fill="#fed7aa"/><text x="476" y="80" text-anchor="middle" class="svg-ink" font-size="12">no, risk</text>
<rect x="526" y="60" width="92" height="30" rx="4" fill="#fed7aa"/><text x="572" y="80" text-anchor="middle" class="svg-ink" font-size="12">no, risk</text>
<text x="128" y="116" text-anchor="end" class="svg-ink" font-size="13">active</text>
<rect x="142" y="96" width="92" height="30" rx="4" fill="#fed7aa"/><text x="188" y="116" text-anchor="middle" class="svg-ink" font-size="12">no, risk</text>
<rect x="238" y="96" width="92" height="30" rx="4" fill="#bbf7d0"/><text x="284" y="116" text-anchor="middle" class="svg-ink" font-size="12">LACP</text>
<rect x="334" y="96" width="92" height="30" rx="4" fill="#bbf7d0"/><text x="380" y="116" text-anchor="middle" class="svg-ink" font-size="12">LACP</text>
<rect x="430" y="96" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="476" y="116" text-anchor="middle" class="svg-muted" font-size="12">no</text>
<rect x="526" y="96" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="572" y="116" text-anchor="middle" class="svg-muted" font-size="12">no</text>
<text x="128" y="152" text-anchor="end" class="svg-ink" font-size="13">passive</text>
<rect x="142" y="132" width="92" height="30" rx="4" fill="#fed7aa"/><text x="188" y="152" text-anchor="middle" class="svg-ink" font-size="12">no, risk</text>
<rect x="238" y="132" width="92" height="30" rx="4" fill="#bbf7d0"/><text x="284" y="152" text-anchor="middle" class="svg-ink" font-size="12">LACP</text>
<rect x="334" y="132" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="380" y="152" text-anchor="middle" class="svg-muted" font-size="12">no</text>
<rect x="430" y="132" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="476" y="152" text-anchor="middle" class="svg-muted" font-size="12">no</text>
<rect x="526" y="132" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="572" y="152" text-anchor="middle" class="svg-muted" font-size="12">no</text>
<text x="128" y="188" text-anchor="end" class="svg-ink" font-size="13">desirable</text>
<rect x="142" y="168" width="92" height="30" rx="4" fill="#fed7aa"/><text x="188" y="188" text-anchor="middle" class="svg-ink" font-size="12">no, risk</text>
<rect x="238" y="168" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="284" y="188" text-anchor="middle" class="svg-muted" font-size="12">no</text>
<rect x="334" y="168" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="380" y="188" text-anchor="middle" class="svg-muted" font-size="12">no</text>
<rect x="430" y="168" width="92" height="30" rx="4" fill="#bbf7d0"/><text x="476" y="188" text-anchor="middle" class="svg-ink" font-size="12">PAgP</text>
<rect x="526" y="168" width="92" height="30" rx="4" fill="#bbf7d0"/><text x="572" y="188" text-anchor="middle" class="svg-ink" font-size="12">PAgP</text>
<text x="128" y="224" text-anchor="end" class="svg-ink" font-size="13">auto</text>
<rect x="142" y="204" width="92" height="30" rx="4" fill="#fed7aa"/><text x="188" y="224" text-anchor="middle" class="svg-ink" font-size="12">no, risk</text>
<rect x="238" y="204" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="284" y="224" text-anchor="middle" class="svg-muted" font-size="12">no</text>
<rect x="334" y="204" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="380" y="224" text-anchor="middle" class="svg-muted" font-size="12">no</text>
<rect x="430" y="204" width="92" height="30" rx="4" fill="#bbf7d0"/><text x="476" y="224" text-anchor="middle" class="svg-ink" font-size="12">PAgP</text>
<rect x="526" y="204" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="572" y="224" text-anchor="middle" class="svg-muted" font-size="12">no</text>
<rect x="142" y="252" width="16" height="14" fill="#bbf7d0"/><text x="164" y="264" class="svg-muted" font-size="12">forms</text>
<rect x="232" y="252" width="16" height="14" fill="#e2e8f0"/><text x="254" y="264" class="svg-muted" font-size="12">no channel, links stand-alone</text>
<rect x="452" y="252" width="16" height="14" fill="#fed7aa"/><text x="474" y="264" class="svg-muted" font-size="12">no, loop risk</text>
<text x="320" y="290" text-anchor="middle" class="svg-ink" font-size="12">Only 6 of the 25 cells form a channel</text>
</svg><p class="cap">The full matrix. Green cells form a channel; grey cells leave individual links; orange cells are one-sided on bundles that risk a loop.</p></div>

<h3>What actually happens in the "no" cells</h3>
<p>Not all failures look the same, and recognising them in output is the practical skill.</p>
<table class="cmp"><tr><th>Combination</th><th>What you see</th><th>Why</th></tr>
<tr><td>passive + passive, auto + auto</td><td>Po down <code>(SD)</code>, members <code>(I)</code> on both sides; STP blocks the extra links</td><td>Both listen, nobody speaks, no partner found</td></tr>
<tr><td>LACP + PAgP</td><td>Po down, members <code>(I)</code> on both sides</td><td>Each ignores the other's protocol packets</td></tr>
<tr><td>on + any negotiating mode</td><td>on side: Po1 up, members <code>(P)</code>; other side: members <code>(I)</code> (or <code>(s)</code> on some platforms)</td><td>on side forwards as one link, other side as separate links; the misconfig guard then err-disables the on side</td></tr></table>
<p>The last row is the dangerous one. A broadcast frame sent by the negotiating side out of Gi0/1 arrives on the on side's bundle, which may send it back down Gi0/2 as if it were a different port. Catalyst switches catch this with the EtherChannel misconfiguration guard and log <code>%SPANTREE-2-CHNL_MISCFG</code>, then err-disable the channel.</p>

<div class="eg"><p><b>Worked example: choose the modes.</b></p><ul>
<li>Two Catalyst switches, new build: <b>active / active</b>. Both initiate, no chance of passive + passive.</li>
<li>Catalyst to a Linux server with an 802.3ad bond: switch <b>active</b> (the bond also speaks LACP).</li>
<li>Catalyst to a VMware standard vSwitch with IP hash teaming: switch <b>on</b>, because the vSwitch has no LACP.</li>
<li>Old Catalyst pair already running PAgP: <b>desirable / desirable</b> until the next refresh, then migrate to LACP.</li>
<li>Your junior configured one side <b>passive</b>: the other side must be <b>active</b>.</li>
</ul></div>

<h3>Inside one switch: one protocol per channel</h3>
<p>All members of one port-channel on one switch must use the same protocol. If Po1 already runs LACP and you type <code>channel-group 1 mode desirable</code> on another port, IOS rejects the command. Active and passive can be mixed within the same LACP channel, but there is no reason to do so. Use the same mode on every member, and ideally the same channel-group number on both switches to keep documentation readable, even though the number only matters locally.</p>

<div class="warn"><p><b>Common mistake.</b> Assuming "passive is the safe choice on both ends". It is safe in the sense that nothing breaks, but nothing bundles either. The extra links quietly sit blocked by STP.</p></div>

<div class="exam"><p><b>Exam trap.</b> Expect a question listing two switches' modes and asking whether an EtherChannel forms. Scan for: different protocols (no), two listeners (no), on with anything but on (no). Everything else forms. Also, "active/on" does not form a channel even though both sides seem keen.</p></div>

<div class="scn"><h4>The copy-paste template</h4><p>An MSP built a golden template for access switches with <code>channel-group 1 mode passive</code> on the uplinks, reasoning that the distribution switch would always be active. A new distribution switch was then deployed from the same template, so both sides became passive. Forty sites lost half their uplink bandwidth, but nobody noticed for weeks, because traffic still flowed over the one forwarding link. A capacity report finally showed every Po1 as <code>(SD)</code>. The fix was active on the distribution template.</p><p><b>Lesson:</b> passive/passive fails silently. Always check that the Po is <code>(SU)</code> or <code>(RU)</code>, not just that pings work.</p></div>

<div class="iv"><p class="q">"Switch A is active, switch B is desirable. Does the channel come up?"</p><p>Strong answer: no. Active is LACP and desirable is PAgP; the protocols do not interoperate, so both sides stay stand-alone and STP blocks the redundant link. Then state the rules: same protocol, at least one initiator, on only with on. Show you can also describe what the output looks like: Po down, members (I).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Forms a channel: active/active, active/passive, desirable/desirable, desirable/auto, on/on.</li>
<li>Never forms: passive/passive, auto/auto, LACP with PAgP, on with any negotiating mode.</li>
<li>Failed negotiation leaves members stand-alone (I) and STP blocks the extras.</li>
<li>on with a negotiating mode risks a loop; the misconfig guard err-disables it.</li>
<li>One protocol per port-channel; the channel-group number is local to each switch.</li>
</ul></div>
`,hi:`
<p>Ek phone call socho. Call hone ke liye kam se kam ek insaan ko dial karna padta hai, aur dono ko same bhasha bolni padti hai. Do log jo dono phone bajne ka intezaar karte baithe hain, kabhi baat nahi karenge. Jo dial karke French bolta hai, woh sirf Japanese mein jawab dene wale ke saath zyada door nahi jaayega. Aur jo phone use hi nahi karta (mode on), woh sirf aise insaan se "mil" sakta hai jo phone use nahi karta aur seedha pahunch jaata hai. Yahi poori mode table teen sentences mein hai. Ab ise exam-proof banate hain.</p>

<h3>Teen rules</h3>
<ol>
<li><b>Same protocol.</b> LACP modes (active, passive) sirf LACP modes ke saath chalte hain. PAgP modes (desirable, auto) sirf PAgP modes ke saath.</li>
<li><b>Kam se kam ek side ko shuru karna chahiye.</b> Kam se kam ek end par active ya desirable. passive + passive aur auto + auto kabhi channel nahi banate.</li>
<li><b>on sirf on se match karta hai.</b> Static mode koi protocol packets nahi bhejta, isliye woh kisi negotiating mode ke saath pair nahi banata.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="EtherChannel mode combination matrix">
<text x="20" y="22" class="svg-muted" font-size="12">rows: switch A, columns: switch B</text>
<text x="188" y="48" text-anchor="middle" class="svg-ink" font-size="13">on</text>
<text x="284" y="48" text-anchor="middle" class="svg-ink" font-size="13">active</text>
<text x="380" y="48" text-anchor="middle" class="svg-ink" font-size="13">passive</text>
<text x="476" y="48" text-anchor="middle" class="svg-ink" font-size="13">desirable</text>
<text x="572" y="48" text-anchor="middle" class="svg-ink" font-size="13">auto</text>
<text x="128" y="80" text-anchor="end" class="svg-ink" font-size="13">on</text>
<rect x="142" y="60" width="92" height="30" rx="4" fill="#bbf7d0"/><text x="188" y="80" text-anchor="middle" class="svg-ink" font-size="12">channel</text>
<rect x="238" y="60" width="92" height="30" rx="4" fill="#fed7aa"/><text x="284" y="80" text-anchor="middle" class="svg-ink" font-size="12">nahi, risk</text>
<rect x="334" y="60" width="92" height="30" rx="4" fill="#fed7aa"/><text x="380" y="80" text-anchor="middle" class="svg-ink" font-size="12">nahi, risk</text>
<rect x="430" y="60" width="92" height="30" rx="4" fill="#fed7aa"/><text x="476" y="80" text-anchor="middle" class="svg-ink" font-size="12">nahi, risk</text>
<rect x="526" y="60" width="92" height="30" rx="4" fill="#fed7aa"/><text x="572" y="80" text-anchor="middle" class="svg-ink" font-size="12">nahi, risk</text>
<text x="128" y="116" text-anchor="end" class="svg-ink" font-size="13">active</text>
<rect x="142" y="96" width="92" height="30" rx="4" fill="#fed7aa"/><text x="188" y="116" text-anchor="middle" class="svg-ink" font-size="12">nahi, risk</text>
<rect x="238" y="96" width="92" height="30" rx="4" fill="#bbf7d0"/><text x="284" y="116" text-anchor="middle" class="svg-ink" font-size="12">LACP</text>
<rect x="334" y="96" width="92" height="30" rx="4" fill="#bbf7d0"/><text x="380" y="116" text-anchor="middle" class="svg-ink" font-size="12">LACP</text>
<rect x="430" y="96" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="476" y="116" text-anchor="middle" class="svg-muted" font-size="12">nahi</text>
<rect x="526" y="96" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="572" y="116" text-anchor="middle" class="svg-muted" font-size="12">nahi</text>
<text x="128" y="152" text-anchor="end" class="svg-ink" font-size="13">passive</text>
<rect x="142" y="132" width="92" height="30" rx="4" fill="#fed7aa"/><text x="188" y="152" text-anchor="middle" class="svg-ink" font-size="12">nahi, risk</text>
<rect x="238" y="132" width="92" height="30" rx="4" fill="#bbf7d0"/><text x="284" y="152" text-anchor="middle" class="svg-ink" font-size="12">LACP</text>
<rect x="334" y="132" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="380" y="152" text-anchor="middle" class="svg-muted" font-size="12">nahi</text>
<rect x="430" y="132" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="476" y="152" text-anchor="middle" class="svg-muted" font-size="12">nahi</text>
<rect x="526" y="132" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="572" y="152" text-anchor="middle" class="svg-muted" font-size="12">nahi</text>
<text x="128" y="188" text-anchor="end" class="svg-ink" font-size="13">desirable</text>
<rect x="142" y="168" width="92" height="30" rx="4" fill="#fed7aa"/><text x="188" y="188" text-anchor="middle" class="svg-ink" font-size="12">nahi, risk</text>
<rect x="238" y="168" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="284" y="188" text-anchor="middle" class="svg-muted" font-size="12">nahi</text>
<rect x="334" y="168" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="380" y="188" text-anchor="middle" class="svg-muted" font-size="12">nahi</text>
<rect x="430" y="168" width="92" height="30" rx="4" fill="#bbf7d0"/><text x="476" y="188" text-anchor="middle" class="svg-ink" font-size="12">PAgP</text>
<rect x="526" y="168" width="92" height="30" rx="4" fill="#bbf7d0"/><text x="572" y="188" text-anchor="middle" class="svg-ink" font-size="12">PAgP</text>
<text x="128" y="224" text-anchor="end" class="svg-ink" font-size="13">auto</text>
<rect x="142" y="204" width="92" height="30" rx="4" fill="#fed7aa"/><text x="188" y="224" text-anchor="middle" class="svg-ink" font-size="12">nahi, risk</text>
<rect x="238" y="204" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="284" y="224" text-anchor="middle" class="svg-muted" font-size="12">nahi</text>
<rect x="334" y="204" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="380" y="224" text-anchor="middle" class="svg-muted" font-size="12">nahi</text>
<rect x="430" y="204" width="92" height="30" rx="4" fill="#bbf7d0"/><text x="476" y="224" text-anchor="middle" class="svg-ink" font-size="12">PAgP</text>
<rect x="526" y="204" width="92" height="30" rx="4" fill="#e2e8f0"/><text x="572" y="224" text-anchor="middle" class="svg-muted" font-size="12">nahi</text>
<rect x="142" y="252" width="16" height="14" fill="#bbf7d0"/><text x="164" y="264" class="svg-muted" font-size="12">banta hai</text>
<rect x="242" y="252" width="16" height="14" fill="#e2e8f0"/><text x="264" y="264" class="svg-muted" font-size="12">channel nahi, links stand-alone</text>
<rect x="462" y="252" width="16" height="14" fill="#fed7aa"/><text x="484" y="264" class="svg-muted" font-size="12">nahi, loop risk</text>
<text x="320" y="290" text-anchor="middle" class="svg-ink" font-size="12">25 mein se sirf 6 cells channel banate hain</text>
</svg><p class="cap">Poori matrix. Green cells channel banate hain; grey cells individual links chhodte hain; orange cells ek-tarfa on bundles hain jinme loop ka risk hai.</p></div>

<h3>"Nahi" wale cells mein asal mein kya hota hai</h3>
<p>Saare failures ek jaise nahi dikhte, aur output mein unhe pehchanna hi practical skill hai.</p>
<table class="cmp"><tr><th>Combination</th><th>Aapko kya dikhta hai</th><th>Kyun</th></tr>
<tr><td>passive + passive, auto + auto</td><td>Po down <code>(SD)</code>, dono sides par members <code>(I)</code>; STP extra links block karta hai</td><td>Dono sunte hain, koi bolta nahi, partner nahi milta</td></tr>
<tr><td>LACP + PAgP</td><td>Po down, dono sides par members <code>(I)</code></td><td>Har side doosre ke protocol packets ignore karti hai</td></tr>
<tr><td>on + koi bhi negotiating mode</td><td>on side: Po1 up, members <code>(P)</code>; doosri side: members <code>(I)</code> (kuch platforms par <code>(s)</code>)</td><td>on side ek link ki tarah forward karti hai, doosri side alag links ki tarah; phir misconfig guard on side ko err-disable karta hai</td></tr></table>
<p>Aakhri row khatarnak hai. Negotiating side dwara Gi0/1 se bheja gaya broadcast frame on side ke bundle par aata hai, jo use Gi0/2 se wapas bhej sakta hai jaise woh alag port ho. Catalyst switches ise EtherChannel misconfiguration guard se pakadte hain, <code>%SPANTREE-2-CHNL_MISCFG</code> log karte hain, phir channel ko err-disable kar dete hain.</p>

<div class="eg"><p><b>Worked example: modes chuno.</b></p><ul>
<li>Do Catalyst switches, naya build: <b>active / active</b>. Dono shuru karte hain, passive + passive ka koi chance nahi.</li>
<li>Catalyst se 802.3ad bond wala Linux server: switch <b>active</b> (bond bhi LACP bolta hai).</li>
<li>Catalyst se IP hash teaming wala VMware standard vSwitch: switch <b>on</b>, kyunki vSwitch mein LACP nahi hai.</li>
<li>Purana Catalyst pair jo pehle se PAgP chala raha hai: agle refresh tak <b>desirable / desirable</b>, phir LACP par migrate.</li>
<li>Aapke junior ne ek side <b>passive</b> configure ki: doosri side <b>active</b> honi chahiye.</li>
</ul></div>

<h3>Ek switch ke andar: har channel ka ek protocol</h3>
<p>Ek switch par ek port-channel ke saare members ko same protocol use karna chahiye. Agar Po1 pehle se LACP chala raha hai aur aap doosre port par <code>channel-group 1 mode desirable</code> type karte ho, to IOS command reject kar deta hai. Same LACP channel mein active aur passive mix ho sakte hain, lekin aisa karne ki koi wajah nahi. Har member par same mode use karo, aur documentation readable rakhne ke liye dono switches par ideally same channel-group number, bhale hi number sirf locally matter karta hai.</p>

<div class="warn"><p><b>Common galti.</b> Yeh maan lena ki "dono ends par passive safe choice hai". Safe is matlab mein ki kuch toot-ta nahi, lekin kuch bundle bhi nahi hota. Extra links chupchap STP se blocked pade rehte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Aisa question expect karo jisme do switches ke modes diye hon aur poocha jaaye ki EtherChannel banega ya nahi. Scan karo: alag protocols (nahi), do sunne wale (nahi), on ke saath on ke alawa kuch bhi (nahi). Baaki sab banta hai. Aur "active/on" channel nahi banata, bhale hi dono sides utsuk lagti hon.</p></div>

<div class="scn"><h4>Copy-paste template</h4><p>Ek MSP ne access switches ke liye golden template banaya jisme uplinks par <code>channel-group 1 mode passive</code> tha, yeh sochkar ki distribution switch hamesha active hoga. Phir ek naya distribution switch usi template se deploy hua, to dono sides passive ho gayi. Chaalees sites ki aadhi uplink bandwidth chali gayi, lekin hafton tak kisi ko pata nahi chala, kyunki traffic ek forwarding link par chalta raha. Aakhir mein capacity report ne har Po1 ko <code>(SD)</code> dikhaya. Fix tha distribution template par active.</p><p><b>Seekh:</b> passive/passive chupchap fail hota hai. Hamesha check karo ki Po <code>(SU)</code> ya <code>(RU)</code> hai, sirf yeh nahi ki pings chal rahe hain.</p></div>

<div class="iv"><p class="q">"Switch A active hai, switch B desirable. Kya channel up hoga?"</p><p>Strong answer: nahi. Active LACP hai aur desirable PAgP; protocols interoperate nahi karte, isliye dono sides stand-alone rehti hain aur STP redundant link block karta hai. Phir rules batao: same protocol, kam se kam ek initiator, on sirf on ke saath. Dikhao ki aap output bhi describe kar sakte ho: Po down, members (I).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Channel banta hai: active/active, active/passive, desirable/desirable, desirable/auto, on/on.</li>
<li>Kabhi nahi banta: passive/passive, auto/auto, LACP ke saath PAgP, on ke saath koi negotiating mode.</li>
<li>Fail hua negotiation members ko stand-alone (I) chhodta hai aur STP extras block karta hai.</li>
<li>Negotiating mode ke saath on loop ka risk rakhta hai; misconfig guard use err-disable karta hai.</li>
<li>Har port-channel ka ek protocol; channel-group number har switch ke liye local hai.</li>
</ul></div>
`}};export{e as default};