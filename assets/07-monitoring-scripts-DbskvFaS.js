var e={id:`monitoring-scripts`,h:{en:`SD-WAN monitoring and scripts in FortiManager`,hi:`FortiManager mein SD-WAN monitoring aur scripts`},body:{en:`
<p>After the install, you need to see what the network is doing, and sometimes you need to make a quick change to many devices. FortiManager offers <b>SD-WAN Monitor</b> views for health and SLA, and <b>scripts</b> for on-demand changes.</p>
<h3>SD-WAN monitoring</h3>
<p>FortiManager collects SD-WAN status from the managed FortiGates and shows it in the GUI. Fortinet describes monitoring in terms of the SD-WAN members (interfaces), the health-check results such as latency, jitter and packet loss, and the rule or service status. Where you find it depends on the release (the Device Manager area and the FortiView or SD-WAN Monitor areas are the usual places, and some releases offer a map view). Use it to answer questions such as:</p>
<ul><li>Which member of BR1-FGT carries the traffic now?</li><li>Which links missed the SLA in the last hour, and on how many branches?</li><li>Is one ISP worse for the whole region?</li></ul>
<table class="cmp"><tr><th>View</th><th>What you learn</th><th>Typical use</th></tr><tr><td>Member status</td><td>Link state, bandwidth use</td><td>Which underlay is carrying traffic</td></tr><tr><td>Health-check and SLA results</td><td>Latency, jitter, loss, SLA met or not</td><td>Find the weak ISP or the weak hub</td></tr><tr><td>Rule or service hits</td><td>Which rule matched, which member was chosen</td><td>Confirm the policy works as designed</td></tr><tr><td>Map or topology view</td><td>Where branches and hubs are, link colours</td><td>Spot a regional problem</td></tr></table>
<div class="note"><p>The monitor shows what FortiManager has collected from the devices, and it can be some time behind. For a live fault, log in to the device and use the commands from fsd-routing and nse4-sdwan (service4, health-check, member list). The central view tells you where to look; the device tells you the truth of this moment.</p></div>
<p>Data collection needs the FortiGate to be reachable from FortiManager and, for the history graphs, logging or monitoring features switched on. If the monitor is empty for a branch, check the connection status first, then the monitoring settings.</p>
<h3>Scripts</h3>
<p>A <b>script</b> is a set of CLI commands that FortiManager runs on demand. You find them under <b>Device Manager</b>, in the scripts area. A script has a name, a type and a target:</p>
<table class="cmp"><tr><th>Run on</th><th>What happens</th><th>Use for</th></tr><tr><td>Device database</td><td>Changes the FortiManager copy of the device; you install afterwards</td><td>Changes you want in the managed configuration and history</td></tr><tr><td>Policy package or ADOM database</td><td>Changes the policy objects in FortiManager</td><td>Bulk changes to objects and policies</td></tr><tr><td>Remote FortiGate directly</td><td>Runs the commands on the device at once</td><td>Quick fixes, or commands that the database cannot hold</td></tr></table>
<p>Running directly on the device bypasses the install preview and can make the device Out of sync (chapter 5), so after such a script, retrieve the configuration or put the same change into a template. You can also run a CLI script as a <b>diagnostic</b>: a script made only of <code>get</code>, <code>show</code> or <code>diagnose</code> commands changes nothing and returns text in the script log. This is a safe way to gather the same output from many branches.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Diagnostic script, run on the device group BRANCHES. Read-only commands.</span>
diagnose sys sdwan health-check
diagnose sys sdwan member
get router info bgp summary
diagnose vpn tunnel list</pre>
<p>Check each command on your FortiOS version before using it on many devices; the names of SD-WAN diagnose commands changed between releases (in 7.6 the service view is <code>diagnose sys sdwan service4</code>).</p>
<h3>Scripts that change configuration</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Script: raise the SLA latency threshold on all branches (device database).</span>
config system sdwan
    config health-check
        edit "HUB1_HC"
            config sla
                edit 1
                    set latency-threshold 200
                next
            end
        next
    end
end</pre>
<p>If the SD-WAN template manages this object, a script on the device database is overwritten by the template at the next change. This is the reason why permanent changes belong in templates, and scripts are used for one-off actions.</p>
<h3>Script log and safety</h3>
<ul><li>Each run creates an entry in the script log with the result per device. Read it; a script can succeed on some devices and fail on others.</li><li>Test on one device. Scripts have no preview like an install does.</li><li>Prefer scripts on the device database followed by an install, so that you get the preview and a revision.</li><li>Use variables in scripts only where your version supports them; otherwise write the values in the script.</li></ul>
<div class="warn"><p><b>Common mistake.</b> Using a remote-device script to fix something that a template owns. The fix works for a day, then the next install removes it, and nobody remembers why. Change the template.</p></div>
<div class="exam"><p><b>Exam trap.</b> Scripts are one-off and can run on the device database, a policy package or the remote device. Only database and package runs go through install. The monitor shows collected data, not live data.</p></div>
<div class="scn"><h4>Which ISP is the problem?</h4><p>Several branches in one region reported slow voice. In the SD-WAN monitor, the engineer saw that the wan2 members of all those branches missed the SLA at the same hours, while wan1 was fine. The cause was one regional ISP. A read-only diagnostic script confirmed the loss values from the devices, and the SLA rule moved voice to wan1 until the ISP fixed the fault.</p><p><b>Lesson:</b> Use the central view to find the pattern, and a diagnostic script to confirm on the devices.</p></div>
<div class="iv"><p class="q">"When do you use a script and when a template?"</p><p>A template for anything that must stay in the managed configuration, because it is reapplied and visible in the install preview and history. A script for one-off changes or for reading state from many devices. If a script changes something a template owns, the template wins at the next install.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>The SD-WAN monitor shows member, health-check and rule data collected by FortiManager.</li><li>Use the device CLI for live truth.</li><li>Scripts run on the device database, a package or the remote device; only the first two go through install.</li><li>Permanent changes belong in templates.</li></ul></div>
`,hi:`
<p>Install ke baad aapko dekhna hota hai ki network kya kar raha hai, aur kabhi kabhi kai devices par jaldi change karna padta hai. FortiManager health aur SLA ke liye <b>SD-WAN Monitor</b> views deta hai, aur demand par changes ke liye <b>scripts</b>.</p>
<h3>SD-WAN monitoring</h3>
<p>FortiManager managed FortiGates se SD-WAN status collect karta hai aur GUI mein dikhata hai. Fortinet monitoring ko SD-WAN members (interfaces), health-check results jaise latency, jitter aur packet loss, aur rule ya service status ke roop mein describe karta hai. Kahan milega yeh release par depend karta hai (Device Manager area aur FortiView ya SD-WAN Monitor areas aam jagah hain, aur kuch releases map view bhi deti hain). Isse aise sawalon ke jawab lo:</p>
<ul><li>BR1-FGT ka kaun sa member abhi traffic le jaa raha hai?</li><li>Pichhle ghante mein kaun se links SLA miss karte rahe, aur kitne branches par?</li><li>Kya ek ISP poore region ke liye kharab hai?</li></ul>
<table class="cmp"><tr><th>View</th><th>Kya pata chalta hai</th><th>Aam use</th></tr><tr><td>Member status</td><td>Link state, bandwidth use</td><td>Kaun si underlay traffic le jaa rahi hai</td></tr><tr><td>Health-check aur SLA results</td><td>Latency, jitter, loss, SLA met ya nahi</td><td>Kamzor ISP ya kamzor hub dhoondhna</td></tr><tr><td>Rule ya service hits</td><td>Kaun sa rule match hua, kaun sa member chuna gaya</td><td>Confirm karna ki policy design ke hisaab se chal rahi hai</td></tr><tr><td>Map ya topology view</td><td>Branches aur hubs kahan hain, link ke colours</td><td>Regional problem pakadna</td></tr></table>
<div class="note"><p>Monitor woh dikhata hai jo FortiManager ne devices se collect kiya hai, aur woh kuch der peeche ho sakta hai. Live fault ke liye device mein login karo aur fsd-routing aur nse4-sdwan ke commands (service4, health-check, member list) use karo. Central view batata hai kahan dekhna hai; device is pal ka sach batata hai.</p></div>
<p>Data collection ke liye FortiGate ka FortiManager se reachable hona zaroori hai, aur history graphs ke liye logging ya monitoring features on hone chahiye. Kisi branch ka monitor khaali ho to pehle connection status check karo, phir monitoring settings.</p>
<h3>Scripts</h3>
<p><b>Script</b> CLI commands ka set hai jo FortiManager demand par chalata hai. Yeh <b>Device Manager</b> mein, scripts area mein milte hain. Script ka naam, type aur target hota hai:</p>
<table class="cmp"><tr><th>Kahan chalta hai</th><th>Kya hota hai</th><th>Kis liye</th></tr><tr><td>Device database</td><td>Device ki FortiManager copy badalta hai; baad mein install karte ho</td><td>Jo changes managed configuration aur history mein chahiye</td></tr><tr><td>Policy package ya ADOM database</td><td>FortiManager mein policy objects badalta hai</td><td>Objects aur policies ke bulk changes</td></tr><tr><td>Remote FortiGate seedha</td><td>Commands device par turant chalte hain</td><td>Quick fixes, ya woh commands jo database nahi rakh sakta</td></tr></table>
<p>Device par seedha chalana install preview ko bypass karta hai aur device ko Out of sync bana sakta hai (chapter 5), isliye aise script ke baad configuration retrieve karo ya wahi change template mein daalo. CLI script ko <b>diagnostic</b> ki tarah bhi chala sakte ho: sirf <code>get</code>, <code>show</code> ya <code>diagnose</code> commands wala script kuch nahi badalta aur script log mein text lautata hai. Kai branches se wahi output ikattha karne ka yeh safe tareeka hai.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Diagnostic script, run on the device group BRANCHES. Read-only commands.</span>
diagnose sys sdwan health-check
diagnose sys sdwan member
get router info bgp summary
diagnose vpn tunnel list</pre>
<p>Kai devices par use karne se pehle har command apne FortiOS version par check karo; SD-WAN diagnose commands ke naam releases ke beech badle hain (7.6 mein service view <code>diagnose sys sdwan service4</code> hai).</p>
<h3>Configuration badalne wale scripts</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Script: raise the SLA latency threshold on all branches (device database).</span>
config system sdwan
    config health-check
        edit "HUB1_HC"
            config sla
                edit 1
                    set latency-threshold 200
                next
            end
        next
    end
end</pre>
<p>Agar SD-WAN template yeh object manage karta hai to device database par chala hua script agle change par template se overwrite ho jaata hai. Isi wajah se permanent changes templates mein jaate hain, aur scripts ek baar ke kaam ke liye hain.</p>
<h3>Script log aur safety</h3>
<ul><li>Har run script log mein har device ke result ke saath entry banata hai. Use padho; script kuch devices par chal sakta hai aur kuch par fail.</li><li>Ek device par test karo. Scripts ka install jaisa preview nahi hota.</li><li>Device database par script chala kar install karna behtar hai, taaki preview aur revision mile.</li><li>Scripts mein variables tabhi use karo jahan aapka version support kare; warna values script mein hi likho.</li></ul>
<div class="warn"><p><b>Common galti.</b> Jo cheez template ki hai use theek karne ke liye remote-device script use karna. Fix ek din chalta hai, phir agla install use hata deta hai, aur kisi ko yaad nahi rehta kyun. Template badlo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Scripts ek baar ke hote hain aur device database, policy package ya remote device par chal sakte hain. Sirf database aur package runs install se guzarte hain. Monitor collected data dikhata hai, live data nahi.</p></div>
<div class="scn"><h4>Kaun sa ISP problem hai?</h4><p>Ek region ke kai branches ne voice slow hone ki shikayat ki. SD-WAN monitor mein engineer ne dekha ki un sabhi branches ke wan2 members ek hi samay SLA miss kar rahe the, jabki wan1 theek tha. Wajah ek regional ISP thi. Read-only diagnostic script ne devices se loss values confirm ki, aur SLA rule ne ISP ke fix hone tak voice ko wan1 par moda.</p><p><b>Seekh:</b> Pattern dhoondhne ke liye central view, aur devices par confirm karne ke liye diagnostic script use karo.</p></div>
<div class="iv"><p class="q">"Script kab aur template kab use karte ho?"</p><p>Jo cheez managed configuration mein rehni chahiye uske liye template, kyunki woh dobara lagu hota hai aur install preview aur history mein dikhta hai. Ek baar ke changes ya kai devices se state padhne ke liye script. Agar script template ki cheez badle to agle install par template jeet jaata hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>SD-WAN monitor FortiManager ka collect kiya member, health-check aur rule data dikhata hai.</li><li>Live sach ke liye device CLI use karo.</li><li>Scripts device database, package ya remote device par chalte hain; pehle do install se guzarte hain.</li><li>Permanent changes templates mein jaate hain.</li></ul></div>
`}};export{e as default};