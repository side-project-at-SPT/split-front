// const initPastures = (pastureAmount) => {
//   for (let i = 0; i < pastureAmount; i++) {
//     if (pastures.value.length === 0){
//       addPasture({ x: 0, y: 0, isEdge: true })
//       continue
//     }
//     setEdgePasture()
//     checkAllIsEdge()
//   }
//   const topX = Math.min(...pastures.value.map(pasture => pasture.x))
//   const topY = Math.min(...pastures.value.map(pasture => pasture.y))
//   console.log(topX, topY)
//   pastures.value.forEach(pasture => {
//     pasture.x -= topX
//     pasture.y -= topY
//   })
// }
// const setEdgePasture = () => {
//   const edgePasture = getAEdgePasture()
//   if (!edgePasture){
//     console.log(pastures.value)
//     return
//   }
//   const directions = [
//     {
//       x: 1, y: 0 
//     },
//     {
//       x: 1, y: -1 
//     },
//     {
//       x: 0, y: -1 
//     },
//     {
//       x: -1, y: 0 
//     },
//     {
//       x: -1, y: 1 
//     },
//     {
//       x: 0, y: 1 
//     } ]
//   const randomIndex = Math.floor(Math.random() * directions.length)
//   for (let i = 0; i < directions.length; i++){
//     const x = edgePasture.x + directions[(randomIndex + i) % directions.length].x
//     const y = edgePasture.y + directions[(randomIndex + i) % directions.length].y
//     if (!pastures.value.find(pasture => pasture.x === x && pasture.y === y)){
//       addPasture({ x, y })
//       break
//     }
//   }
// }
// const checkAllIsEdge = () => {
//   const edgePastures = pastures.value.filter(pasture => pasture.isEdge)
//   edgePastures.forEach(pasture => {
//     pasture.isEdge = checkIsEdge({ x: pasture.x, y: pasture.y })
//   })
// }
// const addPasture = ({ x, y }) => {
//   const isEdge = checkIsEdge({ x, y })
//   pastures.value.push({
//     x, y, amount: 0, selected: false, isAllowTarget: false, isBlocked: false, isEdge
//   })
// }
// const checkIsEdge = ({ x, y }) => {
//   const directions = [
//     {
//       x: 1, y: 0 
//     },
//     {
//       x: 1, y: -1 
//     },
//     {
//       x: 0, y: -1 
//     },
//     {
//       x: -1, y: 0 
//     },
//     {
//       x: -1, y: 1 
//     },
//     {
//       x: 0, y: 1 
//     } ]
//   for (let i = 0; i < directions.length; i++){
//     const target = pastures.value.find(pasture => pasture.x === x + directions[i].x && pasture.y === y + directions[i].y)
//     if (!target) return true
//   }
//   return false
// }
// const checkIsEdgeByMap = ({ pastures, x, y }) => {
//   const directions = [
//     {
//       x: 1, y: 0 
//     },
//     {
//       x: 1, y: -1 
//     },
//     {
//       x: 0, y: -1 
//     },
//     {
//       x: -1, y: 0 
//     },
//     {
//       x: -1, y: 1 
//     },
//     {
//       x: 0, y: 1 
//     } ]
//   for (let i = 0; i < directions.length; i++){
//     const target = pastures.find(pasture => pasture.x === x + directions[i].x && pasture.y === y + directions[i].y)
//     if (!target) return true
//   }
//   return false
// }
// const getAEdgePasture = () => {
//   const edgePastures = pastures.value.filter(pasture => pasture.isEdge)
//   const randomIndex = Math.floor(Math.random() * edgePastures.length)
//   return edgePastures[randomIndex]
// }

// const nextPlayer = () => {
//   if (players.value.every(player => player.isEnd)) {
//     alert('遊戲結束')
//     return
//   }
//   currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length
//   // 判斷還可不可以移動
//   const ownerPastures = pastures.value.filter(pasture => pasture.owner?.id === currentPlayer.value.id)
//   ownerPastures.forEach(pasture => {
//     if (pasture.isBlocked) return
//     if (pasture.amount < 2) pasture.isBlocked = true
//     // 查看是否有可以移動的牧場
//     const directions = [
//       {
//         x: 1, y: 0 
//       },
//       {
//         x: 1, y: -1 
//       },
//       {
//         x: 0, y: -1 
//       },
//       {
//         x: -1, y: 0 
//       },
//       {
//         x: -1, y: 1 
//       },
//       {
//         x: 0, y: 1 
//       }
//     ]
//     let isAlive = false
//     directions.forEach(direction => {
//       let directionAddX = direction.x
//       let directionAddY = direction.y
//       while (true) {
//         if (isAlive) return
//         const target = pastures.value.find(p => p.x === pasture.x + directionAddX && p.y === pasture.y + directionAddY)
//         if (!target || target.amount > 0) {
//           break
//         }
//         if (target.amount === 0) {
//           isAlive = true
//           break
//         }
//         directionAddX += direction.x
//         directionAddY += direction.y
//       }
//     })
//     if (!isAlive) pasture.isBlocked = true
//   })
//   if (ownerPastures.every(pasture => pasture.isBlocked)) {
//     currentPlayer.value.isEnd = true
//     nextPlayer()
//   }
// }