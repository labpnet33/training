var e={id:`build-cluster`,h:{en:`Building an active-passive cluster: checklist and reference configuration`,hi:`Active-passive cluster banana: checklist aur reference configuration`},body:{en:`
<p>Now that you know the pieces, here is the procedure to build a two-unit active-passive cluster. Remember the honest note from chapter 1: the block below is a <b>Reference configuration (not run in the simulator)</b>. It shows the real FortiOS 7.x syntax so that you can read, review and write it in an exam or an interview. Practise the surrounding steps, interfaces, admin access and policies, in the <b>nse4-setup</b> and <b>nse4-policy</b> modules.</p>

<h3>Before you touch the CLI: the pre-flight checklist</h3>
<ol>
<li><b>Same model and same firmware</b> on both units. Upgrade one before clustering; do not rely on the cluster to fix a mismatch.</li>
<li><b>Same licences and features</b>. On virtual machines each unit needs its own valid licence. FortiGuard entitlements are best registered on both units.</li>
<li><b>Same mode</b>: both in NAT mode or both in transparent mode, both with the same VDOM setting.</li>
<li><b>Cabling planned</b>: data interfaces to the same switches or VLANs, and at least two direct heartbeat cables.</li>
<li><b>Switch ports ready</b>: spanning tree and port security must tolerate a virtual MAC and a MAC that moves on failover.</li>
<li><b>Configuration backed up</b> from the unit that has the working configuration.</li>
</ol>

<h3>Which unit keeps its configuration?</h3>
<p>When a unit joins a cluster, it takes the configuration of the elected primary. If you cluster a configured firewall with a blank new one, you want the configured one to win, otherwise its configuration is overwritten by the blank unit. Give the configured unit the <b>higher device priority</b> and join the blank one second. Never connect two units with different live configurations and hope for the best.</p>

<h3>Reference configuration (not run in the simulator)</h3>
<p>FGT-A, the unit that will lead, in active-passive mode with the HQ plan from chapter 3:</p>
<pre class="code"><span class="c"># FGT-A: set a unique host name first</span>
config system global
    set hostname "FGT-A"
end

<span class="c"># FGT-A: HA settings</span>
config system ha
    set group-id 10
    set group-name "NK-HQ-CLUSTER"
    set mode a-p
    set password "Placeholder-Change-Me"
    set hbdev "port3" 50 "port4" 50
    set session-pickup enable
    set session-pickup-connectionless enable
    set override disable
    set priority 200
    set monitor "port1" "port2"
    set ha-mgmt-status enable
    config ha-mgmt-interfaces
        edit 1
            set interface "port8"
            set gateway 192.168.100.1
        next
    end
end</pre>
<p>FGT-B uses the <b>same</b> group ID, group name, password, mode and heartbeat settings, but its own host name, a lower priority and its own management address:</p>
<pre class="code"><span class="c"># FGT-B: differences only</span>
config system global
    set hostname "FGT-B"
end
config system ha
    set group-id 10
    set group-name "NK-HQ-CLUSTER"
    set mode a-p
    set password "Placeholder-Change-Me"
    set hbdev "port3" 50 "port4" 50
    set session-pickup enable
    set session-pickup-connectionless enable
    set override disable
    set priority 100
    set monitor "port1" "port2"
end</pre>
<p>The management interface IP address (for example 192.168.100.11 on FGT-A and 192.168.100.12 on FGT-B) is set on <b>port8</b> of each unit as an ordinary interface address, with the gateway provided in the <code>ha-mgmt-interfaces</code> table. The password is a shared secret used by cluster members to recognise each other; use a long unique value and keep it out of documents.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Build steps">
<rect x="10" y="40" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="75" text-anchor="middle" class="svg-ink" font-size="12">1 Check model</text>
<rect x="135" y="40" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="190" y="75" text-anchor="middle" class="svg-ink" font-size="12">2 Cable</text>
<rect x="260" y="40" width="110" height="60" rx="10" fill="#fde68a"/><text x="315" y="75" text-anchor="middle" class="svg-ink" font-size="12">3 HA on FGT-A</text>
<rect x="385" y="40" width="110" height="60" rx="10" fill="#fed7aa"/><text x="440" y="75" text-anchor="middle" class="svg-ink" font-size="12">4 HA on FGT-B</text>
<rect x="510" y="40" width="120" height="60" rx="10" fill="#ddd6fe"/><text x="570" y="75" text-anchor="middle" class="svg-ink" font-size="12">5 Verify sync</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Same firmware first; configured unit leads; verify before go-live</text>
</svg><p class="cap">Five steps from two boxes to one cluster.</p></div>

<h3>What happens when you apply it</h3>
<p>As soon as the HA settings are applied, each interface switches to the cluster's <b>virtual MAC address</b>, so the connection may drop for a moment and switches will relearn the MAC. Do this in a maintenance window. FGT-B joins, the units compare election criteria, FGT-A becomes primary, and FGT-B receives the configuration and reboots or resynchronises as needed. After a minute or two you should see both units in the cluster. The next chapter shows how to verify it and how to test failover.</p>

<div class="eg"><p><b>Worked example.</b> A new FGT-B arrives for a site that already runs FGT-A. The engineer upgrades FGT-B to the same firmware build as FGT-A, sets the host name, and cables port3 and port4 to FGT-A. HA is configured on FGT-A first (priority 200), then on FGT-B (priority 100). FGT-A stays primary, FGT-B imports the configuration, and the engineer confirms the checksums match before closing the change.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Different firmware builds. A different group name or password, so units never join. Configuring FGT-B first with a higher priority and losing the production configuration. Applying HA in business hours without a maintenance window. Leaving the default weak password.</p></div>
<div class="exam"><p><b>Exam trap.</b> The units must match on group name, password, mode and heartbeat settings, but must differ on host name and priority. If the question shows a pair that will not form a cluster, look first for a mismatch in the matching list.</p></div>

<div class="scn"><h4>The blank box that wiped production</h4><p>A contractor clustered a brand-new FortiGate with the live one but left both at default priority 128 with override off. After the reboot the blank unit won on serial number, became primary, and pushed its empty configuration to the live firewall. The branch went offline until the configuration was restored from backup. Afterwards the team made it a rule: configured unit gets the higher priority, and the backup is taken before clustering.</p><p><b>Lesson:</b> decide who leads before you join the units.</p></div>

<div class="iv"><p class="q">"What do you check before building an FGCP cluster?"</p><p>Same model, same firmware build and licences, same mode and VDOM setup, planned heartbeat cabling with at least two links, switch ports that tolerate a virtual MAC, and a backup. I make sure the unit that holds the live configuration gets the higher priority so it is elected primary.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Match model, firmware, licences, mode, group name, password and heartbeat settings.</li>
<li>Give each unit its own host name and priority.</li>
<li>The configured unit must lead, otherwise its configuration can be overwritten.</li>
<li>Enabling HA changes interfaces to the virtual MAC, so use a maintenance window.</li>
<li>Always back up the configuration first.</li>
</ul></div>
`,hi:`
<p>Ab jab aapko saare pieces pata hain, yeh do-unit active-passive cluster banane ka procedure hai. Chapter 1 ka seedha note yaad rakho: neeche wala block ek <b>Reference configuration (not run in the simulator)</b> hai. Yeh asli FortiOS 7.x syntax dikhata hai taaki aap exam ya interview mein use padh, review aur likh sako. Aas-paas ke steps, interfaces, admin access aur policies ki practice <b>nse4-setup</b> aur <b>nse4-policy</b> modules mein karo.</p>

<h3>CLI chhoone se pehle: pre-flight checklist</h3>
<ol>
<li>Dono units par <b>same model aur same firmware</b>. Clustering se pehle ek ko upgrade karo; mismatch cluster se theek hone par bharosa mat karo.</li>
<li><b>Same licences aur features</b>. Virtual machines par har unit ko apna valid licence chahiye. FortiGuard entitlements dono units par register karna best hai.</li>
<li><b>Same mode</b>: dono NAT mode mein ya dono transparent mode mein, aur same VDOM setting.</li>
<li><b>Cabling planned</b>: data interfaces same switches ya VLANs par, aur kam se kam do direct heartbeat cables.</li>
<li><b>Switch ports ready</b>: spanning tree aur port security ko virtual MAC aur failover par move hone wale MAC ko tolerate karna chahiye.</li>
<li>Jis unit par working configuration hai uska <b>configuration backup</b>.</li>
</ol>

<h3>Kaunsa unit apni configuration rakhta hai?</h3>
<p>Jab koi unit cluster join karta hai to woh elected primary ki configuration le leta hai. Agar aap configured firewall ko blank naye firewall ke saath cluster karte ho to chahte ho ki configured wala jeete, warna uski configuration blank unit se overwrite ho jaati hai. Configured unit ko <b>zyada device priority</b> do aur blank ko doosre number par join karo. Alag live configurations wale do units ko connect karke bhagwan bharose mat chhodo.</p>

<h3>Reference configuration (not run in the simulator)</h3>
<p>FGT-A, jo lead karega, active-passive mode mein chapter 3 ke HQ plan ke saath:</p>
<pre class="code"><span class="c"># FGT-A: pehle unique host name set karo</span>
config system global
    set hostname "FGT-A"
end

<span class="c"># FGT-A: HA settings</span>
config system ha
    set group-id 10
    set group-name "NK-HQ-CLUSTER"
    set mode a-p
    set password "Placeholder-Change-Me"
    set hbdev "port3" 50 "port4" 50
    set session-pickup enable
    set session-pickup-connectionless enable
    set override disable
    set priority 200
    set monitor "port1" "port2"
    set ha-mgmt-status enable
    config ha-mgmt-interfaces
        edit 1
            set interface "port8"
            set gateway 192.168.100.1
        next
    end
end</pre>
<p>FGT-B <b>wahi</b> group ID, group name, password, mode aur heartbeat settings use karta hai, lekin apna host name, kam priority aur apna management address:</p>
<pre class="code"><span class="c"># FGT-B: sirf differences</span>
config system global
    set hostname "FGT-B"
end
config system ha
    set group-id 10
    set group-name "NK-HQ-CLUSTER"
    set mode a-p
    set password "Placeholder-Change-Me"
    set hbdev "port3" 50 "port4" 50
    set session-pickup enable
    set session-pickup-connectionless enable
    set override disable
    set priority 100
    set monitor "port1" "port2"
end</pre>
<p>Management interface IP address (jaise FGT-A par 192.168.100.11 aur FGT-B par 192.168.100.12) har unit ke <b>port8</b> par normal interface address ki tarah set hota hai, gateway <code>ha-mgmt-interfaces</code> table mein di jaati hai. Password ek shared secret hai jisse cluster members ek-doosre ko pehchaante hain; lamba aur unique value use karo aur use documents se door rakho.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Build steps">
<rect x="10" y="40" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="75" text-anchor="middle" class="svg-ink" font-size="12">1 Model check</text>
<rect x="135" y="40" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="190" y="75" text-anchor="middle" class="svg-ink" font-size="12">2 Cabling</text>
<rect x="260" y="40" width="110" height="60" rx="10" fill="#fde68a"/><text x="315" y="75" text-anchor="middle" class="svg-ink" font-size="12">3 FGT-A par HA</text>
<rect x="385" y="40" width="110" height="60" rx="10" fill="#fed7aa"/><text x="440" y="75" text-anchor="middle" class="svg-ink" font-size="12">4 FGT-B par HA</text>
<rect x="510" y="40" width="120" height="60" rx="10" fill="#ddd6fe"/><text x="570" y="75" text-anchor="middle" class="svg-ink" font-size="12">5 Sync verify</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Pehle same firmware; configured unit lead kare; go-live se pehle verify</text>
</svg><p class="cap">Do boxes se ek cluster tak paanch steps.</p></div>

<h3>Apply karne par kya hota hai</h3>
<p>HA settings apply hote hi har interface cluster ke <b>virtual MAC address</b> par switch ho jaata hai, isliye connection ek pal ke liye gir sakta hai aur switches MAC dobara seekhenge. Yeh maintenance window mein karo. FGT-B join karta hai, units election criteria compare karte hain, FGT-A primary banta hai, aur FGT-B configuration receive karta hai aur zaroorat ho to reboot ya resynchronise hota hai. Ek-do minute baad dono units cluster mein dikhne chahiye. Agla chapter dikhata hai ki ise verify kaise karein aur failover kaise test karein.</p>

<div class="eg"><p><b>Worked example.</b> Ek site par FGT-A pehle se chal raha hai aur naya FGT-B aata hai. Engineer FGT-B ko FGT-A ke same firmware build par upgrade karta hai, host name set karta hai, aur port3 aur port4 ko FGT-A se cable karta hai. HA pehle FGT-A par configure hota hai (priority 200), phir FGT-B par (priority 100). FGT-A primary rehta hai, FGT-B configuration import karta hai, aur engineer change close karne se pehle confirm karta hai ki checksums match karte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Alag firmware builds. Alag group name ya password, jisse units kabhi join nahi karte. FGT-B ko pehle zyada priority ke saath configure karna aur production configuration kho dena. Maintenance window ke bina business hours mein HA apply karna. Default kamzor password chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Units ka group name, password, mode aur heartbeat settings match hone chahiye, lekin host name aur priority alag hone chahiye. Question mein aisi pair dikhe jo cluster nahi banati to pehle matching list ka mismatch dhoondho.</p></div>

<div class="scn"><h4>Blank box jisne production saaf kar diya</h4><p>Ek contractor ne bilkul naye FortiGate ko live wale ke saath cluster kiya lekin dono ko default priority 128 aur override off par chhod diya. Reboot ke baad blank unit serial number par jeet gaya, primary ban gaya, aur apni khaali configuration live firewall par push kar di. Branch backup se configuration restore hone tak offline raha. Baad mein team ne rule banaya: configured unit ko zyada priority, aur clustering se pehle backup.</p><p><b>Lesson:</b> units join karne se pehle tay karo ki lead kaun karega.</p></div>

<div class="iv"><p class="q">"FGCP cluster banane se pehle aap kya check karte ho?"</p><p>Same model, same firmware build aur licences, same mode aur VDOM setup, kam se kam do links ke saath planned heartbeat cabling, virtual MAC tolerate karne wale switch ports, aur backup. Main dhyaan rakhta hoon ki jis unit par live configuration hai use zyada priority mile taaki woh primary elect ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Model, firmware, licences, mode, group name, password aur heartbeat settings match karo.</li>
<li>Har unit ko apna host name aur priority do.</li>
<li>Configured unit lead kare, warna uski configuration overwrite ho sakti hai.</li>
<li>HA enable karne se interfaces virtual MAC par aa jaate hain, isliye maintenance window use karo.</li>
<li>Pehle hamesha configuration backup lo.</li>
</ul></div>
`}};export{e as default};