var e={id:`voip-design-worked-example`,h:{en:`A VoIP design with real numbers: sizing, guarantees, guests and ingress limits`,hi:`Asli numbers ke saath VoIP design: sizing, guarantees, guests aur ingress limits`},body:{en:`
<p>A good shaping design starts with arithmetic, not with commands. In this chapter we size the voice class for BR1-FGT, then check what happens when ISP1 fails and everything moves to the smaller link. The numbers are estimates for planning; measure your own codec and overhead before you commit.</p>
<h3>Step 1: bandwidth of one call</h3>
<p>G.711 sends 50 packets per second (20 ms of audio each). Each packet has 160 bytes of audio, plus 12 bytes RTP, 8 bytes UDP and 20 bytes IPv4 = 200 bytes at the IP layer.</p>
<table class="cmp"><tr><th>Layer</th><th>Bytes per packet</th><th>Rate per direction</th></tr><tr><td>IP packet</td><td>200</td><td>200 x 8 x 50 = 80 kbit/s</td></tr><tr><td>With Ethernet header (18 bytes)</td><td>218</td><td>about 87 kbit/s</td></tr><tr><td>Inside an IPsec tunnel (about 60 to 80 bytes of ESP and outer IP)</td><td>about 280</td><td>about 110 kbit/s</td></tr></table>
<p>Use <b>110 kbit/s per call and per direction</b> for a call that crosses the overlay. Compressed codecs (G.729) send smaller payloads, but the headers do not shrink, so the saving is far smaller than the codec rate suggests.</p>
<h3>Step 2: how many calls at the busy hour</h3>
<p>BR1 has 120 phones. A busy-hour assumption of 50 percent concurrent calls gives <b>60 calls</b>. Required voice bandwidth: 60 x 110 kbit/s = 6.6 Mbit/s each way. Add 10 percent for SIP signalling and RTCP: about <b>7.3 Mbit/s</b>.</p>
<h3>Step 3: guarantee and maximum per link</h3>
<table class="cmp"><tr><th>Link</th><th>outbandwidth</th><th>Voice need</th><th>Share needed</th><th>Guarantee chosen</th><th>Maximum chosen</th></tr><tr><td>wan1 (ISP1)</td><td>50 Mbit/s</td><td>7.3 Mbit/s</td><td>about 15 percent</td><td>15 percent = 7.5 Mbit/s</td><td>30 percent = 15 Mbit/s</td></tr><tr><td>wan2 (ISP2)</td><td>18 Mbit/s (20 contract)</td><td>7.3 Mbit/s</td><td>about 41 percent</td><td>45 percent = 8.1 Mbit/s</td><td>60 percent = 10.8 Mbit/s</td></tr></table>
<p>The point of the second row: a profile copied from wan1 gives voice 15 percent of 18 Mbit/s = 2.7 Mbit/s, enough for about 24 calls. After a failover the other 36 calls would be dropped or distorted. The maximum is not wasted capacity: it stops voice from flooding the link if a phone or an attacker sends a lot of UDP marked as EF.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: a separate profile per link, same classes</span>
config firewall shaping-profile
    edit "WAN2-PROFILE"
        set type queuing
        set default-class-id 3
        config shaping-entries
            edit 1
                set class-id 2
                set priority top
                set guaranteed-bandwidth-percentage 45
                set maximum-bandwidth-percentage 60
            next
            edit 2
                set class-id 3
                set priority high
                set guaranteed-bandwidth-percentage 30
                set maximum-bandwidth-percentage 100
            next
            edit 3
                set class-id 4
                set priority low
                set guaranteed-bandwidth-percentage 5
                set maximum-bandwidth-percentage 25
            next
        end
    next
end
config system interface
    edit "wan2"
        set outbandwidth 18000
        set egress-shaping-profile "WAN2-PROFILE"
    next
end</pre>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="diagram"><text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">Voice need 7.3 Mbit/s versus guarantee</text><rect x="20" y="40" width="300" height="30" rx="4" fill="#e2e8f0"/><rect x="20" y="40" width="45" height="30" fill="#bbf7d0"/><text x="330" y="60" class="svg-muted" font-size="12">wan1: 7.5 of 50 Mbit/s (ok)</text><rect x="20" y="90" width="300" height="30" rx="4" fill="#e2e8f0"/><rect x="20" y="90" width="45" height="30" fill="#fecaca"/><text x="330" y="110" class="svg-muted" font-size="12">wan2 with 15%: 2.7 of 18 (too small)</text><rect x="20" y="140" width="300" height="30" rx="4" fill="#e2e8f0"/><rect x="20" y="140" width="135" height="30" fill="#bbf7d0"/><text x="330" y="160" class="svg-muted" font-size="12">wan2 with 45%: 8.1 of 18 (ok)</text></svg><p class="cap">Size the guarantee for the smallest link that voice can fail over to.</p></div>
<h3>Step 4: delay and jitter budget</h3>
<p>The common targets for voice are less than 150 ms one-way delay, less than 30 ms jitter and less than 1 percent loss. Give the voice SLA a margin. For example: latency threshold 100 ms, jitter 20 ms and packet loss 1 percent in the health check, so the rule leaves a link <b>before</b> users complain. The SLA module has the full syntax.</p>
<h3>Step 5: guests and limits per user</h3>
<p>The guest Wi-Fi on BR1 must not harm the business. A per-IP shaper gives each guest address a share, and a shared shaper on the same shaping policy limits all guests together.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
config firewall shaper per-ip-shaper
    edit "GUEST-2M"
        set max-bandwidth 2000
        set max-concurrent-session 200
    next
end
config firewall shaper traffic-shaper
    edit "GUEST-10M"
        set maximum-bandwidth 10000
        set priority low
    next
end
config firewall shaping-policy
    edit 40
        set name "GUEST-LIMIT"
        set srcaddr "GUEST-NET"
        set dstintf "virtual-wan-link"
        set traffic-shaper "GUEST-10M"
        set traffic-shaper-reverse "GUEST-10M"
        set per-ip-shaper "GUEST-2M"
    next
end</pre>
<p>With 40 guests active, each could use 2 Mbit/s, but the shared shaper stops the group at 10 Mbit/s, which is 20 percent of wan1. Place this policy <b>after</b> the voice and business policies, because the first match wins.</p>
<h3>Step 6: limits on incoming traffic</h3>
<p>Download is shaped by the sender, not by you. What you can do is <b>police</b>: set <code>inbandwidth</code> on the interface or use an ingress profile for guests. Excess packets are dropped and the TCP senders slow down. Policing makes TCP sawtooth, so use it as a safety net for a class that must never hurt others, and leave business downloads unpoliced.</p>
<div class="warn"><p><b>Common mistake.</b> Sizing for the average and not for the busy hour, and sizing only for the primary link. The design must work in the failover state, because that is when the link is smaller and everyone is already angry.</p></div>
<div class="exam"><p><b>Exam trap.</b> Calculate with the headers, not with the codec rate alone. G.711 is 80 kbit/s at IP level and more over IPsec. Guarantees are a share of <code>outbandwidth</code>, so a smaller failover link needs a larger percentage. The first matching shaping policy wins.</p></div>
<div class="scn"><h4>Failover kills half of the calls</h4><p>BR1 ran well on ISP1 for months. When ISP1 failed during a storm, the calls moved to wan2 (18 Mbit/s) and about 40 percent of the conversations became robotic. The wan2 profile was a copy of wan1 with 15 percent for voice, 2.7 Mbit/s, while the need was about 7 Mbit/s. The fix was the WAN2-PROFILE with 45 percent for voice, and a failover test every quarter.</p><p><b>Lesson:</b> Test the design in the failure state, with the real call count.</p></div>
<div class="iv"><p class="q">"How would you size a voice class for a branch?"</p><p>I start with the call count in the busy hour and the bandwidth per call including headers and IPsec: about 110 kbit/s per direction for G.711 over the tunnel. 60 calls plus signalling is about 7.3 Mbit/s. On a 50 Mbit/s link that is a guarantee of 15 percent with a maximum of 30 percent. Then I repeat the calculation for the smaller backup link, where the same traffic needs about 45 percent, and I test the failover.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>G.711 is about 80 kbit/s at IP level and about 110 kbit/s per direction over IPsec.</li><li>60 calls with signalling need about 7.3 Mbit/s: 15 percent of 50 Mbit/s but 41 percent of 18 Mbit/s.</li><li>Use one profile per link, sized for that link's capacity.</li><li>Guests: per-IP shaper for fairness and a shared shaper for the group total.</li><li>Policing of incoming traffic is a safety net, not a design tool.</li></ul></div>
`,hi:`
<p>Achha shaping design arithmetic se shuru hota hai, commands se nahi. Is chapter mein hum BR1-FGT ke liye voice class size karte hain, phir dekhte hain ki ISP1 fail hone par sab kuch chhoti link par jaane se kya hota hai. Numbers planning ke liye estimates hain; commit karne se pehle apna codec aur overhead khud measure karo.</p>
<h3>Step 1: ek call ki bandwidth</h3>
<p>G.711 har second 50 packets bhejta hai (har ek mein 20 ms audio). Har packet mein 160 bytes audio, plus 12 bytes RTP, 8 bytes UDP aur 20 bytes IPv4 = IP layer par 200 bytes.</p>
<table class="cmp"><tr><th>Layer</th><th>Bytes per packet</th><th>Rate per direction</th></tr><tr><td>IP packet</td><td>200</td><td>200 x 8 x 50 = 80 kbit/s</td></tr><tr><td>Ethernet header ke saath (18 bytes)</td><td>218</td><td>lagbhag 87 kbit/s</td></tr><tr><td>IPsec tunnel ke andar (ESP aur outer IP ke lagbhag 60 se 80 bytes)</td><td>lagbhag 280</td><td>lagbhag 110 kbit/s</td></tr></table>
<p>Overlay se guzarne wali call ke liye <b>110 kbit/s per call aur per direction</b> use karo. Compressed codecs (G.729) chhota payload bhejte hain, par headers chhote nahi hote, isliye bachat codec rate se bahut kam hoti hai.</p>
<h3>Step 2: busy hour mein kitni calls</h3>
<p>BR1 mein 120 phones hain. Busy-hour ka 50 percent concurrent calls ka assumption <b>60 calls</b> deta hai. Zaroori voice bandwidth: 60 x 110 kbit/s = har taraf 6.6 Mbit/s. SIP signalling aur RTCP ke liye 10 percent jodo: lagbhag <b>7.3 Mbit/s</b>.</p>
<h3>Step 3: har link par guarantee aur maximum</h3>
<table class="cmp"><tr><th>Link</th><th>outbandwidth</th><th>Voice need</th><th>Zaroori share</th><th>Chuni guarantee</th><th>Chuna maximum</th></tr><tr><td>wan1 (ISP1)</td><td>50 Mbit/s</td><td>7.3 Mbit/s</td><td>lagbhag 15 percent</td><td>15 percent = 7.5 Mbit/s</td><td>30 percent = 15 Mbit/s</td></tr><tr><td>wan2 (ISP2)</td><td>18 Mbit/s (contract 20)</td><td>7.3 Mbit/s</td><td>lagbhag 41 percent</td><td>45 percent = 8.1 Mbit/s</td><td>60 percent = 10.8 Mbit/s</td></tr></table>
<p>Doosri row ka point: wan1 se copy kiya profile voice ko 18 Mbit/s ka 15 percent = 2.7 Mbit/s deta hai, jo lagbhag 24 calls ke liye kaafi hai. Failover ke baad baaki 36 calls drop ya kharaab ho jaayengi. Maximum bekaar capacity nahi hai: yeh voice ko link bharne se rokta hai agar koi phone ya attacker EF mark kiya hua bahut UDP bheje.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: a separate profile per link, same classes</span>
config firewall shaping-profile
    edit "WAN2-PROFILE"
        set type queuing
        set default-class-id 3
        config shaping-entries
            edit 1
                set class-id 2
                set priority top
                set guaranteed-bandwidth-percentage 45
                set maximum-bandwidth-percentage 60
            next
            edit 2
                set class-id 3
                set priority high
                set guaranteed-bandwidth-percentage 30
                set maximum-bandwidth-percentage 100
            next
            edit 3
                set class-id 4
                set priority low
                set guaranteed-bandwidth-percentage 5
                set maximum-bandwidth-percentage 25
            next
        end
    next
end
config system interface
    edit "wan2"
        set outbandwidth 18000
        set egress-shaping-profile "WAN2-PROFILE"
    next
end</pre>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="diagram"><text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">Voice need 7.3 Mbit/s versus guarantee</text><rect x="20" y="40" width="300" height="30" rx="4" fill="#e2e8f0"/><rect x="20" y="40" width="45" height="30" fill="#bbf7d0"/><text x="330" y="60" class="svg-muted" font-size="12">wan1: 7.5 of 50 Mbit/s (ok)</text><rect x="20" y="90" width="300" height="30" rx="4" fill="#e2e8f0"/><rect x="20" y="90" width="45" height="30" fill="#fecaca"/><text x="330" y="110" class="svg-muted" font-size="12">wan2 with 15%: 2.7 of 18 (chhota)</text><rect x="20" y="140" width="300" height="30" rx="4" fill="#e2e8f0"/><rect x="20" y="140" width="135" height="30" fill="#bbf7d0"/><text x="330" y="160" class="svg-muted" font-size="12">wan2 with 45%: 8.1 of 18 (ok)</text></svg><p class="cap">Guarantee ko sabse chhoti link ke liye size karo jis par voice failover kar sakti hai.</p></div>
<h3>Step 4: delay aur jitter budget</h3>
<p>Voice ke common targets: one-way delay 150 ms se kam, jitter 30 ms se kam aur loss 1 percent se kam. Voice SLA mein margin rakho. Jaise: health check mein latency threshold 100 ms, jitter 20 ms aur packet loss 1 percent, taaki rule users ke shikayat karne se <b>pehle</b> link chhod de. Poora syntax SLA module mein hai.</p>
<h3>Step 5: guests aur per-user limits</h3>
<p>BR1 ka guest Wi-Fi business ko nuksaan nahi pahunchana chahiye. Per-IP shaper har guest address ko ek hissa deta hai, aur usi shaping policy par shared shaper saare guests ko milakar limit karta hai.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
config firewall shaper per-ip-shaper
    edit "GUEST-2M"
        set max-bandwidth 2000
        set max-concurrent-session 200
    next
end
config firewall shaper traffic-shaper
    edit "GUEST-10M"
        set maximum-bandwidth 10000
        set priority low
    next
end
config firewall shaping-policy
    edit 40
        set name "GUEST-LIMIT"
        set srcaddr "GUEST-NET"
        set dstintf "virtual-wan-link"
        set traffic-shaper "GUEST-10M"
        set traffic-shaper-reverse "GUEST-10M"
        set per-ip-shaper "GUEST-2M"
    next
end</pre>
<p>40 active guests ke saath har ek 2 Mbit/s use kar sakta hai, par shared shaper group ko 10 Mbit/s par rok deta hai, jo wan1 ka 20 percent hai. Is policy ko voice aur business policies ke <b>baad</b> rakho, kyunki pehla match jeet-ta hai.</p>
<h3>Step 6: incoming traffic par limits</h3>
<p>Download ko sender shape karta hai, aap nahi. Aap jo kar sakte ho woh <b>police</b> karna hai: interface par <code>inbandwidth</code> set karo ya guests ke liye ingress profile use karo. Excess packets drop hote hain aur TCP senders dheeme ho jaate hain. Policing TCP ko sawtooth banati hai, isliye use us class ke safety net ke roop mein use karo jo doosron ko kabhi nuksaan na pahunchaye, aur business downloads ko unpoliced rakho.</p>
<div class="warn"><p><b>Common galti.</b> Average ke liye size karna, busy hour ke liye nahi, aur sirf primary link ke liye size karna. Design failover state mein chalna chahiye, kyunki tab link chhoti hoti hai aur sab pehle se naraaz hote hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hisaab headers ke saath karo, sirf codec rate se nahi. G.711 IP level par 80 kbit/s hai aur IPsec par us se zyaada. Guarantees <code>outbandwidth</code> ka share hain, isliye chhoti failover link ko bada percentage chahiye. Pehli matching shaping policy jeet-ti hai.</p></div>
<div class="scn"><h4>Failover aadhi calls maar deta hai</h4><p>BR1 mahino tak ISP1 par theek chala. Toofan mein ISP1 fail hua to calls wan2 (18 Mbit/s) par chali gayi aur lagbhag 40 percent baatcheet robotic ho gayi. wan2 profile wan1 ki copy tha jisme voice ke liye 15 percent, yaani 2.7 Mbit/s, tha, jabki zaroorat lagbhag 7 Mbit/s thi. Fix: WAN2-PROFILE jisme voice ke liye 45 percent, aur har quarter failover test.</p><p><b>Seekh:</b> Design ko failure state mein, asli call count ke saath test karo.</p></div>
<div class="iv"><p class="q">"Branch ke liye voice class kaise size karoge?"</p><p>Main busy hour ki call count aur headers samet IPsec ke saath har call ki bandwidth se shuru karta hoon: G.711 ke liye tunnel par lagbhag 110 kbit/s per direction. Signalling ke saath 60 calls lagbhag 7.3 Mbit/s hain. 50 Mbit/s link par yeh 15 percent guarantee aur 30 percent maximum hai. Phir main chhoti backup link ke liye hisaab dohrata hoon, jahan wahi traffic lagbhag 45 percent maangta hai, aur failover test karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>G.711 IP level par lagbhag 80 kbit/s aur IPsec par lagbhag 110 kbit/s per direction hai.</li><li>Signalling ke saath 60 calls ko lagbhag 7.3 Mbit/s chahiye: 50 Mbit/s ka 15 percent lekin 18 Mbit/s ka 41 percent.</li><li>Har link ke liye ek profile, us link ki capacity ke hisaab se.</li><li>Guests: fairness ke liye per-IP shaper aur group total ke liye shared shaper.</li><li>Incoming traffic ki policing safety net hai, design tool nahi.</li></ul></div>
`}};export{e as default};