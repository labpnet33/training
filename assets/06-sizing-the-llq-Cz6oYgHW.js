var e={id:`sizing-the-llq`,h:{en:`Sizing the priority queue: calls, bandwidth and admission control`,hi:`Priority queue ka size: calls, bandwidth aur admission control`},body:{en:`<h3>Why size matters so much</h3>
<p>The priority queue (LLQ) is a fast lane with a speed limit. Inside the limit, voice goes first and is never dropped. Above the limit, during congestion, the router drops the excess so that the priority class cannot starve the other classes. So a priority queue that is <b>too small</b> drops voice exactly when the link is busy, and one that is <b>too large</b> lets a flood of EF traffic eat the circuit. Sizing is arithmetic, and it is worth doing carefully.</p>
<h3>The formula</h3>
<div class="eg"><p><b>Priority rate = number of simultaneous calls x bandwidth per call x (1 + margin)</b></p><p>Bandwidth per call comes from chapter 2: 80 kbps (G.711 at layer 3), about 87 kbps on Ethernet, 24 to 31 kbps for G.729. Simultaneous calls means the <b>peak</b> number of calls that can cross this link at the same time, not the number of phones. Margin is 10 to 20 percent for layer 2 differences and for a call that starts a moment too early.</p></div>
<p>Count each call once per direction: a call uses the same bandwidth in both directions, but the two directions are on two different queues (the branch router's WAN output and the hub router's WAN output), so each router is sized for the calls crossing it in that direction.</p>
<table class="cmp"><tr><th>Branch</th><th>Peak calls to head office</th><th>Codec</th><th>Calculation</th><th>Priority</th></tr>
<tr><td>Pune</td><td>10</td><td>G.711</td><td>10 x 87 kbps = 870, add 15 percent = 1000</td><td>priority 1000</td></tr>
<tr><td>Delhi</td><td>6</td><td>G.711</td><td>6 x 87 = 522, add 15 percent = 600</td><td>priority 600</td></tr>
<tr><td>Small shop</td><td>4</td><td>G.729</td><td>4 x 31 = 124, add 15 percent = 143</td><td>priority 150</td></tr>
<tr><td>Mumbai hub</td><td>all branches together: 16</td><td>G.711</td><td>16 x 87 = 1392, add 15 percent = 1600</td><td>priority 1600 per aggregate</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Priority rate against offered voice">
<line x1="60" y1="170" x2="600" y2="170" stroke="#64748b" stroke-width="2"/><line x1="60" y1="170" x2="60" y2="30" stroke="#64748b" stroke-width="2"/>
<text x="330" y="196" text-anchor="middle" class="svg-muted" font-size="12">number of simultaneous calls</text>
<line x1="60" y1="170" x2="540" y2="50" stroke="#0ea5e9" stroke-width="3"/>
<text x="470" y="46" class="svg-accent" font-size="12">offered voice (87 kbps per call)</text>
<line x1="60" y1="94" x2="600" y2="94" stroke="#f97316" stroke-width="3" stroke-dasharray="6 4"/>
<text x="600" y="86" text-anchor="end" class="svg-ink" font-size="12">priority 1000 kbps (policing rate)</text>
<circle cx="362" cy="94" r="5" fill="#ef4444"/><text x="372" y="120" class="svg-ink" font-size="12">call 12: limit reached</text>
<text x="200" y="150" class="svg-muted" font-size="12">inside the limit: no drops</text>
<text x="450" y="150" class="svg-muted" font-size="12">above: every call loses packets</text></svg><p class="cap">When offered voice crosses the priority rate, every call loses packets, not just the new one.</p></div>
<h3>The limits around the queue</h3>
<ul><li><b>About one third of the link</b> for priority traffic in total. Beyond that the other classes suffer and a mis-marked flow becomes dangerous.</li>
<li><b>About 75 percent of the link</b> for the sum of all guaranteed classes, which leaves room for routing protocols and best effort.</li>
<li>The router refuses a policy whose guarantees exceed the interface speed ("requested bandwidth ... available only ..."), which is a useful error because it tells you the speed the router believes in. On a router with a faster physical port and a slower provider circuit the percentages are taken from the port speed unless you shape (chapter 4 of mq-wan).</li></ul>
<h3>Priority burst and the implicit policer</h3>
<p>Below the line rate the priority class can burst without drops. The burst allowance is a token bucket: by default it is a fraction of a second of the priority rate, and you can set it with <code>priority 1000 25000</code> (rate in kbps, burst in bytes). In the lab output below the priority class shows <code>burst bytes 25000</code> for 1000 kbps. The key line is <b>b/w exceed drops</b>: it counts packets dropped because the priority class offered more than its rate while the link was congested.</p>
<pre class="out">R-PUN#show policy-map interface GigabitEthernet0/0 output
 GigabitEthernet0/0

  Service-policy output: WAN-OUT

    Class-map: EF-Q (match-any)
      10000 packets, 2000000 bytes
      30 second offered rate 666667 bps, drop rate 28000 bps
      Match: dscp ef (46)
      <span class="hl">Priority: 128 kbps, burst bytes 3200, b/w exceed drops: 420</span>
      Queueing
      queue limit 512 packets
      (queue depth/total drops/no-buffer drops) 0/420/0
      (pkts output/bytes output) 9580/1916000</pre>
<p>This output comes from the quality lab: 800 kbps of voice is offered into a 128 kbps priority class, so 420 packets are dropped. Raising the priority to 1000 kbps removes the drops. Note that the drops appear only while the link is congested; on an idle link the excess voice would pass.</p>
<h3>Admission control: stopping call number twelve</h3>
<p>QoS can protect the quality of eleven calls only by refusing the twelfth. That is <b>call admission control (CAC)</b>. The call server (for example a "location" with a bandwidth limit in the call manager, or RSVP between sites) counts calls and rejects a new one when the configured bandwidth for that site is used up. The user then hears a busy tone or the call goes through the normal telephone network. Without CAC, the twelfth call is admitted, the priority class overflows, and all twelve calls become bad. The router cannot do CAC by itself; the call-control system must be configured to match the router's priority rate (for example 12 calls x 87 kbps = 1044, so 1000 kbps allows 11 calls: set the site limit to 11).</p>
<h3>Sizing video</h3>
<p>Video is sized as a <b>bandwidth</b> class, not as priority. Add up the streams that can run at once, using the codec's <i>peak</i> rate, and add 20 percent: three 720p meetings at 1.5 Mbps each is 4.5 Mbps plus headroom. If that does not fit in your 75 percent budget, limit the number of simultaneous meetings, lower the resolution or buy bandwidth: priority will not help. In the lab the AF41 guarantee is 3000 kbps and the video stream is 3000 kbps, so it fits exactly; one more stream would share class-default behaviour above the guarantee.</p>
<div class="warn"><p><b>Common mistake.</b> Setting the priority rate from the circuit speed ("10 percent of 10 Mbps is fine") without counting calls. The right number comes from the call plan, and the percentage is only a limit check.</p></div>
<div class="exam"><p><b>Exam trap.</b> The priority class is policed <b>only during congestion</b>, and it is policed to its configured rate. It is not a reservation of bandwidth that is idle: unused priority bandwidth is available to the other classes.</p></div>
<div class="scn"><h4>Scenario: Twelve calls, eleven seats</h4><p>Zenith Logistics sized Pune for eleven G.711 calls (priority 1000). A new marketing team added a conference line and the call manager still allowed 20 calls. On a busy afternoon twelve calls started; every call dropped packets (the router showed 5 percent in "b/w exceed drops"). The fix was not a bigger queue but a location limit of 11 calls in the call manager and a widening of the circuit to 20 Mbps with priority 1700 for the next quarter.</p><p><b>Lesson:</b> Match the router's priority rate to the call manager's admission limit, and revisit both when the headcount changes.</p></div>
<div class="iv"><p class="q">"How do you size an LLQ for a branch?"</p><p>Count peak simultaneous calls, multiply by the per-call rate including layer 2 overhead, add a margin, keep priority under a third of the link, and configure admission control to the same number. Then verify with a test load and the "b/w exceed drops" counter.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Priority rate = peak calls x bandwidth per call x margin (10 to 20 percent).</li><li>Priority is policed to its rate during congestion; above it, every call loses packets.</li><li>Stay under about 33 percent priority and about 75 percent guaranteed in total.</li><li>Admission control is what protects the existing calls; QoS alone cannot.</li><li>Video gets a bandwidth class sized from peak stream rates, not priority.</li></ul></div>`,hi:`<h3>Size itna kyun matter karta hai</h3>
<p>Priority queue (LLQ) speed limit wali fast lane hai. Limit ke andar voice pehle jaati hai aur kabhi drop nahi hoti. Limit ke upar, congestion mein, router excess drop kar deta hai taaki priority class baaki classes ko bhookha na maare. Isliye <b>chhoti</b> priority queue theek tab voice drop karti hai jab link busy ho, aur <b>badi</b> queue EF traffic ki baadh ko circuit khane deti hai. Sizing arithmetic hai, aur ise dhyan se karna chahiye.</p>
<h3>Formula</h3>
<div class="eg"><p><b>Priority rate = ek saath calls ki sankhya x har call ki bandwidth x (1 + margin)</b></p><p>Har call ki bandwidth chapter 2 se aati hai: 80 kbps (G.711 layer 3 par), Ethernet par lagbhag 87 kbps, G.729 ke liye 24 se 31 kbps. Ek saath calls ka matlab is link se ek saath guzarne wali calls ki <b>peak</b> sankhya hai, phones ki sankhya nahi. Margin layer 2 ke antar aur ek call jo thodi jaldi shuru ho jaaye uske liye 10 se 20 percent hai.</p></div>
<p>Har call ko ek direction mein ek baar gino: call dono directions mein same bandwidth leti hai, lekin dono directions do alag queues par hain (branch router ka WAN output aur hub router ka WAN output), isliye har router us direction mein guzarne wali calls ke liye size hota hai.</p>
<table class="cmp"><tr><th>Branch</th><th>Head office ko peak calls</th><th>Codec</th><th>Hisaab</th><th>Priority</th></tr>
<tr><td>Pune</td><td>10</td><td>G.711</td><td>10 x 87 kbps = 870, 15 percent jodo = 1000</td><td>priority 1000</td></tr>
<tr><td>Delhi</td><td>6</td><td>G.711</td><td>6 x 87 = 522, 15 percent jodo = 600</td><td>priority 600</td></tr>
<tr><td>Chhoti shop</td><td>4</td><td>G.729</td><td>4 x 31 = 124, 15 percent jodo = 143</td><td>priority 150</td></tr>
<tr><td>Mumbai hub</td><td>saari branches mila kar: 16</td><td>G.711</td><td>16 x 87 = 1392, 15 percent jodo = 1600</td><td>priority 1600 aggregate par</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Priority rate aur offered voice">
<line x1="60" y1="170" x2="600" y2="170" stroke="#64748b" stroke-width="2"/><line x1="60" y1="170" x2="60" y2="30" stroke="#64748b" stroke-width="2"/>
<text x="330" y="196" text-anchor="middle" class="svg-muted" font-size="12">ek saath calls ki sankhya</text>
<line x1="60" y1="170" x2="540" y2="50" stroke="#0ea5e9" stroke-width="3"/>
<text x="470" y="46" class="svg-accent" font-size="12">offered voice (87 kbps per call)</text>
<line x1="60" y1="94" x2="600" y2="94" stroke="#f97316" stroke-width="3" stroke-dasharray="6 4"/>
<text x="600" y="86" text-anchor="end" class="svg-ink" font-size="12">priority 1000 kbps (policing rate)</text>
<circle cx="362" cy="94" r="5" fill="#ef4444"/><text x="372" y="120" class="svg-ink" font-size="12">call 12: limit paar</text>
<text x="200" y="150" class="svg-muted" font-size="12">limit ke andar: drops nahi</text>
<text x="450" y="150" class="svg-muted" font-size="12">upar: har call packets khoti hai</text></svg><p class="cap">Offered voice priority rate paar kare to har call packets khoti hai, sirf nayi nahi.</p></div>
<h3>Queue ke aas-paas ki limits</h3>
<ul><li>Kul priority traffic ke liye <b>link ka lagbhag ek tihai</b>. Usse zyada par baaki classes ko nuksaan hota hai aur galat-mark hua flow khatarnak ho jaata hai.</li>
<li>Saari guaranteed classes ke jod ke liye <b>link ka lagbhag 75 percent</b>, taaki routing protocols aur best effort ke liye jagah bache.</li>
<li>Router aisi policy mana kar deta hai jiski guarantees interface speed se zyada hon ("requested bandwidth ... available only ..."), jo upyogi error hai kyunki yeh batata hai ki router kaun si speed maanta hai. Tez physical port aur dheemi provider circuit wale router par percentages port speed se nikalte hain jab tak aap shape na karo (mq-wan ka chapter 4).</li></ul>
<h3>Priority burst aur implicit policer</h3>
<p>Line rate ke neeche priority class bina drops ke burst kar sakti hai. Burst allowance ek token bucket hai: default mein woh priority rate ke ek second ke hisse ke barabar hota hai, aur use <code>priority 1000 25000</code> se set kar sakte ho (rate kbps mein, burst bytes mein). Neeche lab output mein priority class 1000 kbps ke liye <code>burst bytes 25000</code> dikhati hai. Sabse zaroori line <b>b/w exceed drops</b> hai: yeh un packets ko ginti hai jo isliye drop hue ki congestion ke dauran priority class ne apne rate se zyada offer kiya.</p>
<pre class="out">R-PUN#show policy-map interface GigabitEthernet0/0 output
 GigabitEthernet0/0

  Service-policy output: WAN-OUT

    Class-map: EF-Q (match-any)
      10000 packets, 2000000 bytes
      30 second offered rate 666667 bps, drop rate 28000 bps
      Match: dscp ef (46)
      <span class="hl">Priority: 128 kbps, burst bytes 3200, b/w exceed drops: 420</span>
      Queueing
      queue limit 512 packets
      (queue depth/total drops/no-buffer drops) 0/420/0
      (pkts output/bytes output) 9580/1916000</pre>
<p>Yeh output quality lab se hai: 128 kbps ki priority class mein 800 kbps voice offer hui, isliye 420 packets drop hue. Priority ko 1000 kbps karne se drops hat jaate hain. Dhyan do ki drops sirf tab dikhte hain jab link congested ho; khaali link par excess voice nikal jaati.</p>
<h3>Admission control: call number baarah ko rokna</h3>
<p>QoS gyarah calls ki quality tabhi bacha sakta hai jab baarahvin ko mana kare. Yahi <b>call admission control (CAC)</b> hai. Call server (jaise call manager mein bandwidth limit wala "location", ya sites ke beech RSVP) calls ginta hai aur us site ki configured bandwidth khatam hone par nayi call reject karta hai. User ko busy tone sunai deta hai ya call normal telephone network se jaati hai. CAC ke bina baarahvin call admit ho jaati hai, priority class overflow hoti hai, aur saari baarah calls kharab ho jaati hain. Router khud CAC nahi kar sakta; call-control system ko router ke priority rate se match karke configure karna padta hai (jaise 12 calls x 87 kbps = 1044, isliye 1000 kbps 11 calls deta hai: site limit 11 rakho).</p>
<h3>Video ka size</h3>
<p>Video <b>bandwidth</b> class ki tarah size hota hai, priority ki tarah nahi. Jo streams ek saath chal sakti hain unhe codec ke <i>peak</i> rate se jodo aur 20 percent jodo: 1.5 Mbps ki teen 720p meetings 4.5 Mbps plus headroom hain. Agar yeh aapke 75 percent budget mein nahi aata to ek saath meetings ki sankhya limit karo, resolution ghatao ya bandwidth kharido: priority madad nahi karegi. Lab mein AF41 guarantee 3000 kbps hai aur video stream 3000 kbps, isliye theek fit hota hai; ek aur stream guarantee ke upar class-default jaisa behave karti.</p>
<div class="warn"><p><b>Common mistake.</b> Priority rate circuit speed se tay karna ("10 Mbps ka 10 percent theek hai") bina calls gine. Sahi number call plan se aata hai, aur percentage sirf limit check hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Priority class <b>sirf congestion mein</b> police hoti hai, aur apne configured rate par police hoti hai. Yeh khaali padi bandwidth ki reservation nahi hai: unused priority bandwidth baaki classes ke liye available hai.</p></div>
<div class="scn"><h4>Scenario: Baarah calls, gyarah seats</h4><p>Zenith Logistics ne Pune ko gyarah G.711 calls ke liye size kiya (priority 1000). Ek naye marketing team ne conference line jodi aur call manager ab bhi 20 calls allow karta tha. Ek busy dopahar baarah calls shuru hui; har call ne packets khoye (router ne "b/w exceed drops" mein 5 percent dikhaya). Fix badi queue nahi thi balki call manager mein 11 calls ki location limit thi aur agli quarter ke liye circuit ko 20 Mbps karna priority 1700 ke saath.</p><p><b>Lesson:</b> Router ke priority rate ko call manager ki admission limit se milao, aur headcount badalne par dono dobara dekho.</p></div>
<div class="iv"><p class="q">"Branch ke liye LLQ ka size kaise tay karte ho?"</p><p>Peak ek saath calls gino, layer 2 overhead sahit per-call rate se guna karo, margin jodo, priority link ke ek tihai se neeche rakho, aur admission control ko usi number par configure karo. Phir test load aur "b/w exceed drops" counter se verify karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Priority rate = peak calls x har call ki bandwidth x margin (10 se 20 percent).</li><li>Priority congestion mein apne rate par police hoti hai; usse upar har call packets khoti hai.</li><li>Lagbhag 33 percent priority aur kul lagbhag 75 percent guaranteed se neeche raho.</li><li>Admission control maujooda calls ko bachata hai; akela QoS nahi bacha sakta.</li><li>Video ko peak stream rates se size ki hui bandwidth class milti hai, priority nahi.</li></ul></div>`}};export{e as default};