import React from 'react'
import ReactDOM from 'react-dom'
import './style-index.scss';
import {Provider} from 'react-redux';
import store from './store';
import { Router, IndexRoute,  Route, browserHistory } from 'react-router'

import LoginPage from '@/pages/login'
import SignupPage from '@/pages/signup'
import HomePage from '@/pages/home'
import PagePage from '@/pages/page/index'
import MediaPage from '@/pages/media/index'
import EditPagePage from '@/pages/page/edit'
import SettingPage from '@/pages/setting/index'

import HomeLayout from '@/layouts/home'
import MainLayout from '@/layouts/main'

const _404Page = props => <div>404</div>

const routeConfig = [
	{
		path: '/',
		component: HomeLayout,
		type: Route,
		child: [
			{
				component: HomePage,
				type: IndexRoute
			}
		]
	},
	{
		path: '/site/:siteId',
		component: MainLayout,
		type: Route,
		child: [
			{
				component: HomePage,
				type: IndexRoute
			},
			{
				path: 'page/:pageId',
				component: EditPagePage,
				type: Route
			},
			{
				path: 'page',
				component: PagePage,
				type: Route,
			},
			{
				path: 'media',
				component: MediaPage,
				type: Route,
			},
			{
				path: 'setting',
				component: SettingPage,
				type: Route
			}
		]
	},
	{
		path: '/auth',
		type: Route,
		child: [
			{
				path: 'login',
				component: LoginPage,
				type: Route
			},
			{
				path: 'signup',
				component: SignupPage,
				type: Route
			}
		]
	},
	{
		path: '/*',
		type: Route,
		component: _404Page
	}
]

const getRoutes = routeConfigs => {
	return routeConfigs.map((route, key) => {

		let propsObj = {}

		if(route.path) {
			propsObj.path = route.path
		}
		if(route.component) {
			propsObj.component = route.component
		}
		return <route.type key={Math.random()} {...propsObj}>
			{route.child && getRoutes(route.child)}
		</route.type>
	})
}

class App extends React.Component {
	render() {
		return <Provider store = {store}>
			<Router history={browserHistory}>
				{getRoutes(routeConfig)}
				{
					/*
					routeConfig.map((route1, key1) => {
						let propsObj = {
							path: route1.path
						}
						if(route1.component) {
							propsObj.component = route1.component
						}
						return <route1.type key={key1} {...propsObj}>
							{route1.child && route1.child.map((route2, key2) => {
								let propsObj = {
									path: route2.path
								}
								if(route2.component) {
									propsObj.component = route2.component
								}
								return <route2.type key={key2} {...propsObj}></route2.type>
							})}
						</route1.type>
					})
					*/
				}
	      
    </Router>
		</Provider>
	}
}
export {routeConfig}
export default App
