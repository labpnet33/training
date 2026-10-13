var e=(e,t)=>({en:e,hi:t}),t=[{title:e(`Jaipur CRM is Poor`,`Jaipur CRM Poor hai`),ticket:e(`Lab zs-zdx-2: Jaipur Sales say the CRM is slow. Pune and Chennai are fine. Find the slow hop.`,`Lab zs-zdx-2: Jaipur Sales kehti hai CRM slow hai. Pune aur Chennai theek hain. Slow hop dhundo.`),out:`Digital experience > User detail   kabir   app: CRM
Hop               Value        Baseline   vs baseline
Device            cpu 30%      35%        below
Wi-Fi             good         good       equal
Internet circuit  loss 7%      loss 0.5%  far above
Cloud path        rtt 30 ms    30 ms      equal
Application       server 205   200        equal
Score 22 (Poor)   Cause: Internet circuit`,q:e(`Which hop is the cause and who acts?`,`Kaun sa hop cause hai aur kaun act karega?`),o:[e(`Application, the CRM owner`,`Application, CRM owner`),e(`Internet circuit, the network team with the ISP`,`Internet circuit, network team ISP ke saath`),e(`Device, desktop support`,`Device, desktop support`),e(`Wi-Fi, the wireless team`,`Wi-Fi, wireless team`)],a:1,w:e(`Only the circuit hop is far above baseline; others are normal. The circuit belongs to the network team and the ISP.`,`Sirf circuit hop baseline se bahut upar hai; baaki normal hain. Circuit network team aur ISP ka hai.`)},{title:e(`No data for the CRM`,`CRM ke liye no data`),ticket:e(`Ticket 321110 (part 1): the CRM shows no data for anyone while users complain. Why?`,`Ticket 321110 (part 1): users complain kar rahe hain jabki CRM kisi ke liye data nahi dikhata. Kyun?`),out:`Digital experience > Applications
Global monitoring .. enabled
App     Probe     Alert below   Sites affected
CRM     disabled  10            (no data)
Mail    enabled   40            none`,q:e(`What is the first fix?`,`Pehla fix kya hai?`),o:[e(`Block the CRM in URL filtering`,`CRM ko URL filtering mein block karo`),e(`Replace the Jaipur circuit`,`Jaipur circuit replace karo`),e(`Turn global monitoring off`,`Global monitoring off karo`),e(`Enable the CRM probe`,`CRM probe enable karo`)],a:3,w:e(`Without a probe nothing is measured, so there is no score. Global monitoring is already on.`,`Probe ke bina kuch measure nahi hota, to score nahi. Global monitoring pehle se on hai.`)},{title:e(`Poor users, silent alerts`,`Poor users, chup alerts`),ticket:e(`Ticket 321110 (part 2): the CRM probe is now on, scores are Poor, but no alert fired.`,`Ticket 321110 (part 2): CRM probe ab on hai, scores Poor hain, lekin alert nahi aaya.`),out:`Digital experience > Applications
App     Probe     Alert below   Lowest score
CRM     enabled   10            22 (Poor)
Mail    enabled   40            68`,q:e(`What explains the missing alert?`,`Alert na aane ka kya explanation hai?`),o:[e(`The threshold of 10 is far below the Poor boundary, so 22 never triggers it`,`Threshold 10 Poor boundary se bahut neeche hai, to 22 use kabhi trigger nahi karta`),e(`The probe is disabled`,`Probe disabled hai`),e(`SAML expired`,`SAML expire ho gaya`),e(`The tunnel is down`,`Tunnel down hai`)],a:0,w:e(`A score of 22 is above 10, so an alert set to fire below 10 stays silent. Raise it near the Poor boundary.`,`22 score 10 se upar hai, to 10 se neeche fire hone wala alert chup rehta hai. Use Poor boundary ke paas karo.`)},{title:e(`One user Poor on Wi-Fi`,`Ek user Wi-Fi par Poor`),ticket:e(`Ticket: only one user, anita, is Poor; colleagues at the same site are Good.`,`Ticket: sirf ek user, anita, Poor hai; same site ke colleagues Good hain.`),out:`User detail   anita   app: Mail   site: Pune
Hop               Value        Baseline   vs baseline
Device            cpu 38%      35%        equal
Wi-Fi             weak         good       far above
Internet circuit  loss 0.4%    0.5%       equal
Cloud path        rtt 29 ms    30 ms      equal
Application       server 190   200        equal
Score 31 (Poor)   Cause: Wi-Fi
Colleagues: ravi 82 Good`,q:e(`Best next action?`,`Agla best action kya hai?`),o:[e(`Open a circuit ticket with the ISP`,`ISP ke saath circuit ticket kholo`),e(`Rebuild the IPsec tunnel`,`IPsec tunnel dobara banao`),e(`Check the wireless signal at her desk and access point`,`Uske desk par wireless signal aur access point check karo`),e(`Raise the application alert threshold`,`Application alert threshold badhao`)],a:2,w:e(`One user Poor and the Wi-Fi hop far above baseline points to local wireless. The circuit and cloud path are normal.`,`Ek user Poor aur Wi-Fi hop baseline se bahut upar local wireless ki taraf ishara karta hai. Circuit aur cloud path normal hain.`)},{title:e(`High CPU on a laptop`,`Laptop par high CPU`),ticket:e(`Ticket: one engineer says everything is slow, not only the CRM.`,`Ticket: ek engineer kehta hai sab kuch slow hai, sirf CRM nahi.`),out:`User detail   meena   app: Git   site: Chennai
Hop               Value        Baseline   vs baseline
Device            cpu 97%      35%        far above
Wi-Fi             good         good       equal
Internet circuit  loss 0.3%    0.5%       equal
Cloud path        rtt 31 ms    30 ms      equal
Application       server 180   180        equal
Score 29 (Poor)   Cause: Device`,q:e(`Who should act first?`,`Pehle kaun act kare?`),o:[e(`The ISP`,`ISP`),e(`Desktop support, to see what is using the CPU`,`Desktop support, dekhne ke liye ki CPU kaun use kar raha hai`),e(`The Git server owner`,`Git server owner`),e(`The security team, to block the site`,`Security team, site block karne ke liye`)],a:1,w:e(`Device is the only hop far above baseline. Other hops are normal, so the fault is the laptop.`,`Device hi akela hop hai jo baseline se bahut upar hai. Baaki hops normal hain, to fault laptop ka hai.`)},{title:e(`Long cloud path`,`Lamba cloud path`),ticket:e(`Ticket: the whole Chennai site is Poor for every application after a weekend; circuit looks clean.`,`Ticket: weekend ke baad poori Chennai site har application ke liye Poor hai; circuit clean dikhta hai.`),out:`User detail   meena   app: CRM   site: Chennai
Hop               Value        Baseline   vs baseline
Device            cpu 33%      35%        equal
Wi-Fi             good         good       equal
Internet circuit  loss 0.4%    0.5%       equal
Cloud path        rtt 190 ms   30 ms      far above
Application       server 200   200        equal
Score 27 (Poor)   Cause: Cloud path`,q:e(`What should you check first?`,`Pehle kya check karoge?`),o:[e(`Which cloud node the tunnel uses and whether it failed over to a distant one`,`Tunnel kaun sa cloud node use kar raha hai aur kya woh distant node par failover hua`),e(`The laptop CPU`,`Laptop CPU`),e(`The CRM server database`,`CRM server database`),e(`The Wi-Fi signal`,`Wi-Fi signal`)],a:0,w:e(`The cloud path hop is far above baseline while the circuit is clean, so look at tunnel state and the node in use.`,`Cloud path hop baseline se bahut upar hai jabki circuit clean hai, to tunnel state aur use ho rahe node ko dekho.`)}];export{t as default};