var e={id:`policing`,h:{en:`Policing in MQC: police, conform, exceed, violate`,hi:`MQC mein policing: police, conform, exceed, violate`},body:{en:`
<p>A policer is the simplest rate tool: measure, then act at once. It needs no queue, so it is cheap, and it can sit on an input or an output interface. In this chapter you write policers in MQC, learn the three colours, remark instead of drop, and read the counters. Everything here is lab <b>mq-wan-police</b>.</p>

<h3>The command</h3>
<p>A policer lives inside a class of a policy-map. The classification (chapter 4 of <b>mq-mark</b>) decides which packets reach it; the <code>police</code> line decides what happens to them.</p>
<pre class="code"><span class="c">! Zenith Logistics, Pune: the classes</span>
ip access-list extended BACKUP-ACL
 permit tcp any any eq 873
ip access-list extended STREAM-ACL
 permit udp any any eq 9000
class-map match-any BACKUP
 match access-group name BACKUP-ACL
class-map match-any STREAM
 match access-group name STREAM-ACL
<span class="c">! the policy: two policers with different exceed actions</span>
policy-map LIMIT-IN
 class BACKUP
  police cir 2000000 conform-action transmit exceed-action drop
 class STREAM
  police cir 3000000 conform-action transmit exceed-action set-dscp-transmit af13
interface GigabitEthernet0/1
 service-policy input LIMIT-IN</pre>
<p><code>cir</code> is in <b>bits per second</b>: 2 Mbps is 2000000. If you do not give <code>bc</code> the router picks CIR/32 bytes (62,500 bytes at 2 Mbps). The line <code>police cir 2000000</code> typed without actions enters a sub-mode where you write <code>conform-action</code>, <code>exceed-action</code> and <code>violate-action</code> on separate lines; both styles end up identical in the configuration.</p>

<h3>Actions and colours</h3>
<table class="cmp"><tr><th>Action</th><th>Meaning</th></tr>
<tr><td><code>transmit</code></td><td>Send the packet unchanged</td></tr>
<tr><td><code>drop</code></td><td>Discard it</td></tr>
<tr><td><code>set-dscp-transmit af13</code></td><td>Send it with a new DSCP (also <code>set-prec-transmit</code>, and on real platforms <code>set-cos-transmit</code>)</td></tr></table>
<ul>
<li><b>Two colours</b> (conform, exceed): you give <code>cir</code> and optionally <code>bc</code>. Default exceed action is <code>drop</code>.</li>
<li><b>Three colours</b> (conform, exceed, violate): you also give <code>be</code>. Packets that find Bc empty but Be available exceed; packets that find both empty violate.</li>
<li><b>Dual rate</b> adds a peak rate (<code>pir</code>) and is common in provider networks. This simulator does not model it, so we only describe it: it passes traffic up to PIR but marks what is above CIR as exceeding.</li>
</ul>
<pre class="code">policy-map TRI
 class STREAM
  police cir 3000000 bc 94000 be 94000 conform-action transmit exceed-action set-dscp-transmit af12 violate-action drop</pre>

<h3>Why remark instead of drop?</h3>
<p>Dropping above the contract is blunt. A gentler design transmits the excess but lowers its priority so that any congestion further along drops it first. A common pattern: conform keeps the marking, exceed sets AF13 (or CS1 for scavenger), violate drops. The video stream in the lab does this: up to 3 Mbps it is untouched, above that it travels as AF13. Remember the remark is only useful if a later hop has a WRED or queue policy that treats AF13 worse than AF11 or default.</p>

<h3>Reading the counters</h3>
<p>Send 6 Mbps of backup and 8 Mbps of video from PC1 for 20 seconds, then look at the input policy:</p>
<pre class="out">R1#show policy-map interface GigabitEthernet0/1 input
  Service-policy input: LIMIT-IN
    Class-map: BACKUP (match-any)
      8576 packets, 12006400 bytes
      30 second offered rate 6403413 bps, drop rate 4236747 bps
      Match: access-group name BACKUP-ACL
      police:
          cir 2000000 bps, bc 62500 bytes
        conformed 2908 packets, 4062500 bytes; actions:
          transmit
        <span class="hl">exceeded 5668 packets, 7943900 bytes; actions:</span>
          <span class="hl">drop</span>
        conformed 2000000 bps, exceeded 4403413 bps
    Class-map: STREAM (match-any)
      police:
          cir 3000000 bps, bc 93750 bytes
        conformed 30469 packets, 6093750 bytes; actions:
          transmit
        exceeded 49531 packets, 9906250 bytes; actions:
          <span class="hl">set-dscp-transmit af13</span></pre>
<p>Read it in three steps: (1) is the class matching, that is, are the packets and bytes growing? (2) do conformed plus exceeded add up to the class total? (3) what is the action line under <i>exceeded</i>? The first backup flow lost two thirds of its packets: <code>traffic show</code> on PC1 reports 66 percent loss for tcp/873 and 0 percent for the video, because the video was only remarked.</p>
<p>The same command on a three-colour policer prints a third block:</p>
<pre class="out">        conformed 30470 packets, 6094000 bytes; actions:
          transmit
        exceeded 470 packets, 94000 bytes; actions:
          set-dscp-transmit af12
        violated 49060 packets, 9812000 bytes; actions:
          drop</pre>

<div class="eg"><p><b>Worked example.</b> Policer 2 Mbps, offered 6 Mbps. Conformed rate: 2 Mbps. Exceeded: 6 - 2 = 4 Mbps (the counters show 4.4 Mbps because bursts and the 30 second average add noise). Share dropped: 4/6 = 66 percent, exactly what the sender saw.</p></div>

<h3>Where to put it</h3>
<ul>
<li><b>Input at the edge</b>: stops unwanted traffic before it uses the WAN queue or CPU. Used for guest networks, backups, scavenger classes.</li>
<li><b>Output</b>: allowed, used to limit what a class sends to a customer or to a service.</li>
<li>Never rely on a policer for <i>queuing</i>: <code>bandwidth</code>, <code>priority</code> and <code>shape</code> are rejected on an input policy. (LLQ has its own implicit policer, see <b>mq-queue</b>.)</li>
</ul>
<div class="note"><p><b>Junos note.</b> The equivalent is a policer applied through a firewall filter:</p>
<pre class="code">set firewall policer BACKUP-2M if-exceeding bandwidth-limit 2m
set firewall policer BACKUP-2M if-exceeding burst-size-limit 62500
set firewall policer BACKUP-2M then discard
set firewall family inet filter LIMIT-IN term BACKUP from protocol tcp
set firewall family inet filter LIMIT-IN term BACKUP from destination-port 873
set firewall family inet filter LIMIT-IN term BACKUP then policer BACKUP-2M
set firewall family inet filter LIMIT-IN term REST then accept
set interfaces ge-0/0/1 unit 0 family inet filter input LIMIT-IN</pre>
<p>To remark instead of discard, the policer uses <code>then loss-priority high</code> (and optionally <code>forwarding-class</code>) in place of <code>then discard</code>. The burst is in bytes.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Writing 2000 when you meant 2 Mbps: the unit is bps, so 2000 is below the 8000 bps minimum and is rejected. (2) Forgetting that a class-map ACL only selects: <code>permit</code> means "in the class", not "allowed through". (3) Applying the policy output when you wanted input, then wondering why the LAN-side packets are not touched. (4) Remarking to a DSCP that the next hop treats as better than the original.</p></div>
<div class="exam"><p><b>Exam trap.</b> The default exceed action is drop and the default conform action is transmit. A policer with <code>be</code> and a <code>violate-action</code> is single-rate three-colour; the colour-aware variants need <code>conform-color</code> and are less common.</p></div>

<div class="scn"><h4>The backup that took the whole link</h4><p>At Zenith Logistics the nightly rsync (TCP 873) used all 100 Mbps and starved the training video. The engineer added the LIMIT-IN policy above: backup capped at 2 Mbps with drop, video allowed 3 Mbps and remarked to AF13 beyond that. The backup now takes longer, but it never stops the video and the morning summary no longer fails. When the director asked for faster backups, the engineer raised the cap to 10 Mbps in a maintenance window instead of removing the policer.</p><p><b>Lesson:</b> a policer turns an unbounded flow into a known one. The number becomes a business decision.</p></div>
<div class="iv"><p class="q">"What is the difference between exceed and violate?"</p><p>With a single-rate three-colour policer, Bc is the first bucket and Be the second, filled by the spill of the first. A packet that finds enough tokens in Bc conforms; if Bc is short but Be has tokens it exceeds; if both are short it violates. Typical actions are transmit, remark, drop. I would add that a two-colour policer has no violate state.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>police cir BPS [bc BYTES [be BYTES]] conform-action ... exceed-action ... [violate-action ...]</code>.</li>
<li>Actions: transmit, drop, set-dscp-transmit, set-prec-transmit.</li>
<li>Remarking on exceed softens a limit if a later hop treats the new marking worse.</li>
<li>Read conformed, exceeded, violated and the action line under each.</li>
<li>Policing works on input and output; queuing actions do not work on input.</li>
</ul></div>
`,hi:`
<p>Policer sabse simple rate tool hai: naapo, phir turant action lo. Ise queue nahi chahiye, isliye sasta hai, aur input ya output interface par baith sakta hai. Is chapter mein aap MQC mein policers likhoge, teen colours seekhoge, drop ki jagah remark karoge, aur counters padhoge. Yahan sab kuch lab <b>mq-wan-police</b> hai.</p>

<h3>Command</h3>
<p>Policer policy-map ki ek class ke andar rehta hai. Classification (<b>mq-mark</b> ka chapter 4) tay karta hai ki kaun se packets us tak pahunchte hain; <code>police</code> line tay karti hai unka kya hoga.</p>
<pre class="code"><span class="c">! Zenith Logistics, Pune: classes</span>
ip access-list extended BACKUP-ACL
 permit tcp any any eq 873
ip access-list extended STREAM-ACL
 permit udp any any eq 9000
class-map match-any BACKUP
 match access-group name BACKUP-ACL
class-map match-any STREAM
 match access-group name STREAM-ACL
<span class="c">! policy: alag exceed actions wale do policers</span>
policy-map LIMIT-IN
 class BACKUP
  police cir 2000000 conform-action transmit exceed-action drop
 class STREAM
  police cir 3000000 conform-action transmit exceed-action set-dscp-transmit af13
interface GigabitEthernet0/1
 service-policy input LIMIT-IN</pre>
<p><code>cir</code> <b>bits per second</b> mein hai: 2 Mbps matlab 2000000. Agar <code>bc</code> nahi doge to router CIR/32 bytes chunta hai (2 Mbps par 62,500 bytes). Bina actions ke likhi <code>police cir 2000000</code> line ek sub-mode mein le jaati hai jahan aap <code>conform-action</code>, <code>exceed-action</code> aur <code>violate-action</code> alag lines mein likhte ho; dono style configuration mein ek jaise ban jaate hain.</p>

<h3>Actions aur colours</h3>
<table class="cmp"><tr><th>Action</th><th>Matlab</th></tr>
<tr><td><code>transmit</code></td><td>Packet ko jaisa hai waisa bhejo</td></tr>
<tr><td><code>drop</code></td><td>Gira do</td></tr>
<tr><td><code>set-dscp-transmit af13</code></td><td>Naye DSCP ke saath bhejo (<code>set-prec-transmit</code> bhi, aur asli platforms par <code>set-cos-transmit</code>)</td></tr></table>
<ul>
<li><b>Do colours</b> (conform, exceed): aap <code>cir</code> aur optional <code>bc</code> dete ho. Default exceed action <code>drop</code> hai.</li>
<li><b>Teen colours</b> (conform, exceed, violate): aap <code>be</code> bhi dete ho. Jin packets ko Bc khaali par Be available milta hai woh exceed karte hain; jinhe dono khaali milte hain woh violate karte hain.</li>
<li><b>Dual rate</b> mein peak rate (<code>pir</code>) judta hai aur provider networks mein common hai. Yeh simulator ise model nahi karta, isliye hum sirf describe karte hain: yeh PIR tak traffic jaane deta hai lekin CIR se upar ko exceeding mark karta hai.</li>
</ul>
<pre class="code">policy-map TRI
 class STREAM
  police cir 3000000 bc 94000 be 94000 conform-action transmit exceed-action set-dscp-transmit af12 violate-action drop</pre>

<h3>Drop ki jagah remark kyun?</h3>
<p>Contract se upar drop karna rukha tareeka hai. Naram design excess ko bhejta hai lekin uski priority ghata deta hai taaki aage congestion mein pehle wahi gire. Common pattern: conform marking rakhta hai, exceed AF13 (ya scavenger ke liye CS1) set karta hai, violate drop karta hai. Lab ka video stream yahi karta hai: 3 Mbps tak untouched, usse upar AF13 ke roop mein jaata hai. Yaad rakho remark tabhi kaam ka hai jab aage ke hop par WRED ya queue policy AF13 ko AF11 ya default se kharab treat kare.</p>

<h3>Counters padhna</h3>
<p>PC1 se 20 second ke liye 6 Mbps backup aur 8 Mbps video bhejo, phir input policy dekho:</p>
<pre class="out">R1#show policy-map interface GigabitEthernet0/1 input
  Service-policy input: LIMIT-IN
    Class-map: BACKUP (match-any)
      8576 packets, 12006400 bytes
      30 second offered rate 6403413 bps, drop rate 4236747 bps
      Match: access-group name BACKUP-ACL
      police:
          cir 2000000 bps, bc 62500 bytes
        conformed 2908 packets, 4062500 bytes; actions:
          transmit
        <span class="hl">exceeded 5668 packets, 7943900 bytes; actions:</span>
          <span class="hl">drop</span>
        conformed 2000000 bps, exceeded 4403413 bps
    Class-map: STREAM (match-any)
      police:
          cir 3000000 bps, bc 93750 bytes
        conformed 30469 packets, 6093750 bytes; actions:
          transmit
        exceeded 49531 packets, 9906250 bytes; actions:
          <span class="hl">set-dscp-transmit af13</span></pre>
<p>Teen step mein padho: (1) kya class match ho rahi hai, yaani packets aur bytes badh rahe hain? (2) kya conformed aur exceeded milkar class total ke barabar hain? (3) <i>exceeded</i> ke neeche action line kya hai? Pehli backup flow ne do tihai packets kho diye: PC1 par <code>traffic show</code> tcp/873 ke liye 66 percent loss batata hai aur video ke liye 0 percent, kyunki video sirf remark hua tha.</p>
<p>Teen-colour policer par wahi command teesra block chhapta hai:</p>
<pre class="out">        conformed 30470 packets, 6094000 bytes; actions:
          transmit
        exceeded 470 packets, 94000 bytes; actions:
          set-dscp-transmit af12
        violated 49060 packets, 9812000 bytes; actions:
          drop</pre>

<div class="eg"><p><b>Worked example.</b> Policer 2 Mbps, offered 6 Mbps. Conformed rate: 2 Mbps. Exceeded: 6 - 2 = 4 Mbps (counters 4.4 Mbps dikhate hain kyunki bursts aur 30 second average thoda shor jodte hain). Drop hua hissa: 4/6 = 66 percent, bilkul wahi jo sender ne dekha.</p></div>

<h3>Kahan lagana hai</h3>
<ul>
<li><b>Edge par input</b>: anchahe traffic ko WAN queue ya CPU use karne se pehle rokta hai. Guest networks, backups, scavenger classes ke liye.</li>
<li><b>Output</b>: allowed hai, kisi class ya service ko jo bheja jaata hai use limit karne ke liye.</li>
<li><i>Queuing</i> ke liye policer par bharosa mat karo: input policy par <code>bandwidth</code>, <code>priority</code> aur <code>shape</code> reject ho jaate hain. (LLQ ka apna implicit policer hai, <b>mq-queue</b> dekho.)</li>
</ul>
<div class="note"><p><b>Junos note.</b> Barabar ka tareeka firewall filter se lagaya policer hai:</p>
<pre class="code">set firewall policer BACKUP-2M if-exceeding bandwidth-limit 2m
set firewall policer BACKUP-2M if-exceeding burst-size-limit 62500
set firewall policer BACKUP-2M then discard
set firewall family inet filter LIMIT-IN term BACKUP from protocol tcp
set firewall family inet filter LIMIT-IN term BACKUP from destination-port 873
set firewall family inet filter LIMIT-IN term BACKUP then policer BACKUP-2M
set firewall family inet filter LIMIT-IN term REST then accept
set interfaces ge-0/0/1 unit 0 family inet filter input LIMIT-IN</pre>
<p>Discard ki jagah remark karne ke liye policer <code>then discard</code> ki jagah <code>then loss-priority high</code> (aur optional <code>forwarding-class</code>) use karta hai. Burst bytes mein hota hai.</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> (1) 2 Mbps ki jagah 2000 likhna: unit bps hai, isliye 2000, 8000 bps minimum se neeche hai aur reject hota hai. (2) Bhool jaana ki class-map ACL sirf chunta hai: <code>permit</code> ka matlab "class mein hai", "jaane diya" nahi. (3) Input chahiye tha aur policy output lagana, phir sochna ki LAN-side packets chhue kyun nahi gaye. (4) Aise DSCP par remark karna jise next hop original se behtar treat karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default exceed action drop hai aur default conform action transmit hai. <code>be</code> aur <code>violate-action</code> wala policer single-rate three-colour hai; colour-aware variants ko <code>conform-color</code> chahiye aur kam common hain.</p></div>

<div class="scn"><h4>Backup jisne poora link le liya</h4><p>Zenith Logistics mein raat ki rsync (TCP 873) ne poore 100 Mbps use kiye aur training video ko bhookha maara. Engineer ne upar wali LIMIT-IN policy lagayi: backup 2 Mbps par drop ke saath cap, video ko 3 Mbps aur usse upar AF13 remark. Backup ab zyada samay leta hai, lekin video ko kabhi nahi rokta aur subah ka summary ab fail nahi hota. Jab director ne tez backups maange, engineer ne policer hatane ki jagah maintenance window mein cap 10 Mbps kar diya.</p><p><b>Lesson:</b> policer unbounded flow ko known flow bana deta hai. Number ek business decision ban jaata hai.</p></div>
<div class="iv"><p class="q">"Exceed aur violate mein kya farq hai?"</p><p>Single-rate three-colour policer mein Bc pehla bucket hai aur Be doosra, jo pehle ke spill se bharta hai. Jis packet ko Bc mein kaafi tokens milte hain woh conform karta hai; Bc kam ho lekin Be mein tokens hon to exceed; dono kam hon to violate. Aam actions transmit, remark, drop hain. Main yeh jodunga ki two-colour policer mein violate state nahi hoti.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>police cir BPS [bc BYTES [be BYTES]] conform-action ... exceed-action ... [violate-action ...]</code>.</li>
<li>Actions: transmit, drop, set-dscp-transmit, set-prec-transmit.</li>
<li>Exceed par remark limit ko naram banata hai agar aage ka hop naye marking ko kharab treat kare.</li>
<li>Conformed, exceeded, violated aur har ke neeche action line padho.</li>
<li>Policing input aur output dono par chalti hai; queuing actions input par nahi.</li>
</ul></div>
`}};export{e as default};