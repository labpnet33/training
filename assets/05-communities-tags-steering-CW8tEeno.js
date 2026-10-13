var e={id:`communities-tags`,h:{en:`Steering with BGP: SD-WAN neighbor, communities and route tags`,hi:`BGP se steering: SD-WAN neighbor, communities aur route tags`},body:{en:`
<p>A branch decides its <b>outbound</b> path with SD-WAN rules and health checks. But what about the <b>return</b> traffic from the data centre to the branch? The hub could measure every spoke itself, but with hundreds of spokes that is heavy and the hub cannot see the spoke's view of the link. Fortinet's answer is <b>self-healing with BGP</b>: the spoke measures its own tunnels and <b>tells the hub through BGP</b> which tunnel is currently healthy. The hub then steers return traffic accordingly. Three FortiOS features cooperate: the <b>SD-WAN neighbor</b> object, <b>conditional route maps</b> on the BGP neighbor, and <b>route tags</b> on the hub.</p>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="diagram"><rect x="10" y="20" width="290" height="100" rx="10" fill="#bae6fd"/><text x="155" y="42" text-anchor="middle" class="svg-ink" font-size="13">SPOKE BR1-FGT</text><text x="155" y="65" text-anchor="middle" class="svg-muted" font-size="11">1. health check HUB1_HC measures VPN1</text><text x="155" y="83" text-anchor="middle" class="svg-muted" font-size="11">2. SLA met: route-map-out-preferable</text><text x="155" y="101" text-anchor="middle" class="svg-muted" font-size="11">    community 65000:1 on 10.1.1.0/24</text><rect x="340" y="20" width="290" height="100" rx="10" fill="#ddd6fe"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="13">HUB HUB1-FGT</text><text x="485" y="65" text-anchor="middle" class="svg-muted" font-size="11">3. route-map-in: community to route tag 1</text><text x="485" y="83" text-anchor="middle" class="svg-muted" font-size="11">4. SD-WAN rule for tag 1: member VPN1</text><text x="485" y="101" text-anchor="middle" class="svg-muted" font-size="11">    return traffic follows the healthy tunnel</text><line x1="300" y1="70" x2="340" y2="70" stroke="#64748b" stroke-width="2"/><rect x="10" y="150" width="620" height="90" rx="10" fill="#fde68a"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">If the SLA fails</text><text x="320" y="198" text-anchor="middle" class="svg-muted" font-size="11">The spoke uses route-map-out instead: community 65000:11 (SLA-Fail)</text><text x="320" y="216" text-anchor="middle" class="svg-muted" font-size="11">The hub matches tag 11 and sends traffic over the other tunnel (priority-members 1 2)</text></svg><p class="cap">The spoke's measurement travels to the hub inside a BGP community.</p></div>
<h3>On the spoke: SLA, neighbor and route maps</h3>
<p>The health check carries an SLA and the option <code>sla-id-redistribute</code>, which names the SLA whose result drives the routing. The SD-WAN <b>neighbor</b> object links a BGP neighbor IP to one or more members, a health check and an SLA id. On the BGP neighbor, <code>route-map-out-preferable</code> is used while the linked members meet the SLA, and the normal <code>route-map-out</code> is used when they do not. Each route map sets a community.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: communities say which tunnel is good</span>
config router route-map
    edit "OUT-VPN1-OK"
        config rule
            edit 1
                set set-community "65000:1"
            next
        end
    next
    edit "OUT-VPN2-OK"
        config rule
            edit 1
                set set-community "65000:2"
            next
        end
    next
    edit "OUT-SLA-FAIL"
        config rule
            edit 1
                set set-community "65000:11"
            next
        end
    next
end
config router bgp
    config neighbor
        edit "169.254.16.1"
            set advertisement-interval 1
            set route-map-out "OUT-SLA-FAIL"
            set route-map-out-preferable "OUT-VPN1-OK"
        next
        edit "169.254.17.1"
            set advertisement-interval 1
            set route-map-out "OUT-SLA-FAIL"
            set route-map-out-preferable "OUT-VPN2-OK"
        next
    end
end
config system sdwan
    config health-check
        edit "HUB1_HC"
            set server "169.254.100.1"
            set sla-id-redistribute 1
            set members 3 4
            config sla
                edit 1
                    set latency-threshold 150
                    set jitter-threshold 30
                    set packetloss-threshold 2
                next
            end
        next
    end
    config neighbor
        edit "169.254.16.1"
            set member 3
            set health-check "HUB1_HC"
            set sla-id 1
        next
        edit "169.254.17.1"
            set member 4
            set health-check "HUB1_HC"
            set sla-id 1
        next
    end
end</pre>
<p>The structure follows Fortinet's "SD-WAN self-healing with BGP" documentation; the names and community values are ours. In the loopback design of chapter 4 there is one neighbor but two members: the SD-WAN neighbor then lists <code>set member 3 4</code> and the setting <code>minimum-sla-meet-members</code> (1 to 255, default 1) says how many of the members must meet the SLA before the <b>preferable</b> route map is used. That is how a single BGP session can still describe the health of several tunnels. Two further neighbor settings exist: <code>role</code> (standalone, primary or secondary) and a global hold-down (<code>neighbor-hold-down</code> with <code>neighbor-hold-down-time</code>) so that traffic does not move back to a primary hub the instant it recovers.</p>
<h3>On the hub: communities become route tags</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT: map communities to route tags, then steer by tag</span>
config router community-list
    edit "C-VPN1-OK"
        config rule
            edit 1
                set action permit
                set match "65000:1"
            next
        end
    next
    edit "C-VPN2-OK"
        config rule
            edit 1
                set action permit
                set match "65000:2"
            next
        end
    next
    edit "C-SLA-FAIL"
        config rule
            edit 1
                set action permit
                set match "65000:11"
            next
        end
    next
end
config router route-map
    edit "IN-TAG"
        config rule
            edit 1
                set match-community "C-VPN1-OK"
                set set-route-tag 1
            next
            edit 2
                set match-community "C-VPN2-OK"
                set set-route-tag 2
            next
            edit 3
                set match-community "C-SLA-FAIL"
                set set-route-tag 11
            next
        end
    next
end
config router bgp
    config neighbor-group
        edit "SPOKES-VPN1"
            set route-map-in "IN-TAG"
        next
        edit "SPOKES-VPN2"
            set route-map-in "IN-TAG"
        next
    end
end
config system sdwan
    config service
        edit 10
            set name "TO-BRANCH-VIA-VPN1"
            set route-tag 1
            set src "all"
            set priority-members 1
        next
        edit 11
            set name "TO-BRANCH-VIA-VPN2"
            set route-tag 2
            set src "all"
            set priority-members 2
        next
        edit 12
            set name "TO-BRANCH-BOTH-DEGRADED"
            set route-tag 11
            set src "all"
            set priority-members 1 2
        next
    end
end</pre>
<div class="note"><p><b>Note.</b> The option <code>route-tag</code> inside an SD-WAN rule is shown in Fortinet's 7.0 documentation, and the community-to-tag route map is the documented mechanism. In the 7.6.0 CLI reference page that I could read, the summary I extracted did not list <code>route-tag</code> among the rule options. Confirm it with <code>set ?</code> inside <code>config service</code> on your 7.6 unit before you rely on this exact line.</p></div>
<h3>Steering per region with communities and local preference</h3>
<p>The same tools express regional policy. Suppose the hubs tag every prefix they advertise with a community that names the hub (65000:100 for HUB1, 65000:200 for HUB2). A route map on the spokes of the western region sets a higher local preference for routes carrying 65000:100, and spokes of the eastern region prefer 65000:200. Each region then uses its nearest hub for everything, and the other hub remains the backup, with no change to the SD-WAN rules. Route maps can also prepend the AS path, but local preference is the simpler lever inside one AS.</p>
<h3>Verification</h3>
<pre class="out"><span class="c">! Reference configuration (not run in the simulator). Illustrative output, values chosen for teaching.</span>
HUB1-FGT # get router info bgp network 10.1.1.0/24
VRF 0 BGP routing table entry for 10.1.1.0/24
Paths: (1 available, best #1, table Default-IP-Routing-Table)
  Local
    169.254.16.10 from 169.254.16.10 (10.255.255.11)
      Origin IGP metric 0, localpref 100, valid, internal, best
      <span class="hl">Community: 65000:1</span></pre>
<p>Also use <code>diagnose sys sdwan neighbor</code> to see the SD-WAN neighbor state, <code>diagnose sys sdwan health-check</code> to read the SLA map (<code>sla_map=0x1</code> means the SLA is met, <code>0x0</code> means not met) and <code>diagnose sys sdwan service4</code> on the hub to see which member each tag rule currently uses.</p>
<div class="warn"><p><b>Common mistake.</b> Setting the community only in <code>route-map-out</code>. That map is used when the SLA is <b>not</b> met. The community that says "this tunnel is good" belongs in <code>route-map-out-preferable</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> route-map-out-preferable applies when the SD-WAN neighbor's members meet the SLA; route-map-out applies otherwise. Tags are created on the hub (set-route-tag) and consumed by an SD-WAN rule.</p></div>
<div class="scn"><h4>Return traffic on the lossy tunnel</h4><p>Branch voice was fine upstream because the spoke rule chose the clean tunnel, but the data centre heard the caller choppily. Return traffic still used the tunnel the hub preferred in BGP, which had 6 percent loss. After the SD-WAN neighbor and the two route maps were added, the spoke advertised the SLA-fail community on the bad tunnel, the hub tagged it with 11 and its rule moved return traffic to the good tunnel within seconds.</p><p><b>Lesson:</b> Steer both directions; let the side that measures tell the side that sends.</p></div>
<div class="iv"><p class="q">"How does the hub know a spoke's tunnel is degraded?"</p><p>The spoke has an SD-WAN neighbor tied to the BGP neighbor, the health check and an SLA id. While the SLA is met it advertises with route-map-out-preferable, adding a community; when it fails it uses the plain route-map-out. The hub maps communities to route tags and an SD-WAN rule matches the tag to pick the tunnel. The hub never needs to probe each spoke.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Self-healing with BGP: the spoke measures, signals by community, the hub steers by route tag.</li><li>SD-WAN neighbor links a BGP neighbor to members, health check and SLA id; minimum-sla-meet-members counts members.</li><li>route-map-out-preferable is used when the SLA is met, route-map-out when it is not.</li><li>Regional preference can be done with community plus local preference in route maps.</li></ul></div>
`,hi:`
<p>Branch apna <b>outbound</b> path SD-WAN rules aur health checks se tay karta hai. Lekin data centre se branch tak ke <b>return</b> traffic ka kya? Hub har spoke ko khud naap sakta hai, lekin saikdon spokes ke saath yeh bhaari hai aur hub spoke ka link ka view dekh nahi sakta. Fortinet ka jawab <b>self-healing with BGP</b> hai: spoke apne tunnels khud naapta hai aur <b>BGP ke through hub ko batata hai</b> ki abhi kaun sa tunnel theek hai. Hub phir return traffic ko usi hisaab se steer karta hai. Teen FortiOS features milkar kaam karte hain: <b>SD-WAN neighbor</b> object, BGP neighbor par <b>conditional route maps</b>, aur hub par <b>route tags</b>.</p>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="diagram"><rect x="10" y="20" width="290" height="100" rx="10" fill="#bae6fd"/><text x="155" y="42" text-anchor="middle" class="svg-ink" font-size="13">SPOKE BR1-FGT</text><text x="155" y="65" text-anchor="middle" class="svg-muted" font-size="11">1. health check HUB1_HC VPN1 naapta hai</text><text x="155" y="83" text-anchor="middle" class="svg-muted" font-size="11">2. SLA met: route-map-out-preferable</text><text x="155" y="101" text-anchor="middle" class="svg-muted" font-size="11">    10.1.1.0/24 par community 65000:1</text><rect x="340" y="20" width="290" height="100" rx="10" fill="#ddd6fe"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="13">HUB HUB1-FGT</text><text x="485" y="65" text-anchor="middle" class="svg-muted" font-size="11">3. route-map-in: community se route tag 1</text><text x="485" y="83" text-anchor="middle" class="svg-muted" font-size="11">4. tag 1 ka SD-WAN rule: member VPN1</text><text x="485" y="101" text-anchor="middle" class="svg-muted" font-size="11">    return traffic healthy tunnel follow karta hai</text><line x1="300" y1="70" x2="340" y2="70" stroke="#64748b" stroke-width="2"/><rect x="10" y="150" width="620" height="90" rx="10" fill="#fde68a"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">SLA fail ho to</text><text x="320" y="198" text-anchor="middle" class="svg-muted" font-size="11">Spoke route-map-out use karta hai: community 65000:11 (SLA-Fail)</text><text x="320" y="216" text-anchor="middle" class="svg-muted" font-size="11">Hub tag 11 match karta hai aur traffic doosre tunnel par bhejta hai (priority-members 1 2)</text></svg><p class="cap">Spoke ki measurement BGP community ke andar hub tak jaati hai.</p></div>
<h3>Spoke par: SLA, neighbor aur route maps</h3>
<p>Health check mein SLA aur option <code>sla-id-redistribute</code> hota hai, jo us SLA ka naam deta hai jiska result routing ko chalata hai. SD-WAN <b>neighbor</b> object ek BGP neighbor IP ko ek ya zyada members, ek health check aur ek SLA id se jodta hai. BGP neighbor par <code>route-map-out-preferable</code> tab use hota hai jab linked members SLA meet karte hain, aur normal <code>route-map-out</code> tab jab nahi karte. Har route map ek community set karta hai.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: communities say which tunnel is good</span>
config router route-map
    edit "OUT-VPN1-OK"
        config rule
            edit 1
                set set-community "65000:1"
            next
        end
    next
    edit "OUT-VPN2-OK"
        config rule
            edit 1
                set set-community "65000:2"
            next
        end
    next
    edit "OUT-SLA-FAIL"
        config rule
            edit 1
                set set-community "65000:11"
            next
        end
    next
end
config router bgp
    config neighbor
        edit "169.254.16.1"
            set advertisement-interval 1
            set route-map-out "OUT-SLA-FAIL"
            set route-map-out-preferable "OUT-VPN1-OK"
        next
        edit "169.254.17.1"
            set advertisement-interval 1
            set route-map-out "OUT-SLA-FAIL"
            set route-map-out-preferable "OUT-VPN2-OK"
        next
    end
end
config system sdwan
    config health-check
        edit "HUB1_HC"
            set server "169.254.100.1"
            set sla-id-redistribute 1
            set members 3 4
            config sla
                edit 1
                    set latency-threshold 150
                    set jitter-threshold 30
                    set packetloss-threshold 2
                next
            end
        next
    end
    config neighbor
        edit "169.254.16.1"
            set member 3
            set health-check "HUB1_HC"
            set sla-id 1
        next
        edit "169.254.17.1"
            set member 4
            set health-check "HUB1_HC"
            set sla-id 1
        next
    end
end</pre>
<p>Structure Fortinet ki "SD-WAN self-healing with BGP" documentation ko follow karta hai; naam aur community values hamare hain. Chapter 4 ke loopback design mein ek neighbor lekin do members hote hain: tab SD-WAN neighbor <code>set member 3 4</code> likhta hai aur setting <code>minimum-sla-meet-members</code> (1 se 255, default 1) batati hai ki <b>preferable</b> route map use hone se pehle kitne members ko SLA meet karna hoga. Isi tarah ek BGP session bhi kai tunnels ki health bata sakta hai. Do aur neighbor settings hain: <code>role</code> (standalone, primary ya secondary) aur global hold-down (<code>neighbor-hold-down</code> aur <code>neighbor-hold-down-time</code>) taaki primary hub recover hote hi traffic turant wapas na jaaye.</p>
<h3>Hub par: communities route tags ban jaate hain</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT: map communities to route tags, then steer by tag</span>
config router community-list
    edit "C-VPN1-OK"
        config rule
            edit 1
                set action permit
                set match "65000:1"
            next
        end
    next
    edit "C-VPN2-OK"
        config rule
            edit 1
                set action permit
                set match "65000:2"
            next
        end
    next
    edit "C-SLA-FAIL"
        config rule
            edit 1
                set action permit
                set match "65000:11"
            next
        end
    next
end
config router route-map
    edit "IN-TAG"
        config rule
            edit 1
                set match-community "C-VPN1-OK"
                set set-route-tag 1
            next
            edit 2
                set match-community "C-VPN2-OK"
                set set-route-tag 2
            next
            edit 3
                set match-community "C-SLA-FAIL"
                set set-route-tag 11
            next
        end
    next
end
config router bgp
    config neighbor-group
        edit "SPOKES-VPN1"
            set route-map-in "IN-TAG"
        next
        edit "SPOKES-VPN2"
            set route-map-in "IN-TAG"
        next
    end
end
config system sdwan
    config service
        edit 10
            set name "TO-BRANCH-VIA-VPN1"
            set route-tag 1
            set src "all"
            set priority-members 1
        next
        edit 11
            set name "TO-BRANCH-VIA-VPN2"
            set route-tag 2
            set src "all"
            set priority-members 2
        next
        edit 12
            set name "TO-BRANCH-BOTH-DEGRADED"
            set route-tag 11
            set src "all"
            set priority-members 1 2
        next
    end
end</pre>
<div class="note"><p><b>Note.</b> SD-WAN rule ke andar <code>route-tag</code> option Fortinet ki 7.0 documentation mein dikhaya gaya hai, aur community se tag wala route map documented mechanism hai. 7.6.0 CLI reference page mein, jo main padh saka, mere nikaale hue summary mein rule options mein <code>route-tag</code> listed nahi tha. Is exact line par bharosa karne se pehle apni 7.6 unit par <code>config service</code> ke andar <code>set ?</code> se confirm karo.</p></div>
<h3>Communities aur local preference se region ke hisaab se steering</h3>
<p>Wahi tools regional policy bhi express karte hain. Maano hubs har advertise kiye prefix par aisi community lagate hain jo hub ka naam batati hai (HUB1 ke liye 65000:100, HUB2 ke liye 65000:200). Western region ke spokes par route map 65000:100 wale routes ko zyada local preference deta hai, aur eastern region ke spokes 65000:200 prefer karte hain. Har region phir sab kuch ke liye apna nazdeeki hub use karta hai, aur doosra hub backup rehta hai, SD-WAN rules mein koi badlav nahi. Route maps AS path prepend bhi kar sakte hain, lekin ek AS ke andar local preference simple lever hai.</p>
<h3>Verification</h3>
<pre class="out"><span class="c">! Reference configuration (not run in the simulator). Illustrative output, values chosen for teaching.</span>
HUB1-FGT # get router info bgp network 10.1.1.0/24
VRF 0 BGP routing table entry for 10.1.1.0/24
Paths: (1 available, best #1, table Default-IP-Routing-Table)
  Local
    169.254.16.10 from 169.254.16.10 (10.255.255.11)
      Origin IGP metric 0, localpref 100, valid, internal, best
      <span class="hl">Community: 65000:1</span></pre>
<p>SD-WAN neighbor state dekhne ke liye <code>diagnose sys sdwan neighbor</code>, SLA map padhne ke liye <code>diagnose sys sdwan health-check</code> (<code>sla_map=0x1</code> matlab SLA met, <code>0x0</code> matlab not met), aur hub par har tag rule abhi kaun sa member use kar raha hai yeh dekhne ke liye <code>diagnose sys sdwan service4</code> bhi use karo.</p>
<div class="warn"><p><b>Common galti.</b> Community sirf <code>route-map-out</code> mein set karna. Woh map tab use hota hai jab SLA <b>meet nahi</b> hota. "Yeh tunnel achha hai" batane wali community <code>route-map-out-preferable</code> mein hoti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> route-map-out-preferable tab lagu hota hai jab SD-WAN neighbor ke members SLA meet karte hain; warna route-map-out. Tags hub par bante hain (set-route-tag) aur SD-WAN rule unhe consume karta hai.</p></div>
<div class="scn"><h4>Lossy tunnel par return traffic</h4><p>Branch voice upstream mein theek thi kyunki spoke rule ne saaf tunnel chuna, lekin data centre ko caller toota-toota sunayi diya. Return traffic ab bhi us tunnel se jaata raha jo hub BGP mein prefer karta tha, jisme 6 percent loss tha. SD-WAN neighbor aur do route maps jodne ke baad spoke ne kharab tunnel par SLA-fail community advertise ki, hub ne use 11 tag diya aur uske rule ne return traffic ko kuch seconds mein achhe tunnel par shift kar diya.</p><p><b>Seekh:</b> Dono directions steer karo; jo side naapti hai woh bhejne wali side ko bataye.</p></div>
<div class="iv"><p class="q">"Hub ko kaise pata chalta hai ki spoke ka tunnel degraded hai?"</p><p>Spoke ke paas BGP neighbor, health check aur SLA id se bandha SD-WAN neighbor hota hai. Jab tak SLA met hai woh route-map-out-preferable ke saath advertise karta hai, jo community jodta hai; fail hone par woh plain route-map-out use karta hai. Hub communities ko route tags mein map karta hai aur SD-WAN rule tag match karke tunnel chunta hai. Hub ko har spoke ko probe karne ki zarurat nahi.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>BGP se self-healing: spoke naapta hai, community se signal deta hai, hub route tag se steer karta hai.</li><li>SD-WAN neighbor BGP neighbor ko members, health check aur SLA id se jodta hai; minimum-sla-meet-members members ginta hai.</li><li>route-map-out-preferable SLA met hone par, route-map-out nahi hone par use hota hai.</li><li>Regional preference route maps mein community plus local preference se ho sakti hai.</li></ul></div>
`}};export{e as default};